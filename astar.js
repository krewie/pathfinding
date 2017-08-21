var _ = require('lodash');
var heap = require('./minheap').BinaryHeap;

Astar({
    x: 0,
    y: 0
}, {
    x: 50,
    y: 5
}, [{
    x: -1,
    y: -1
}, {
    x: -1,
    y: 0
}, {
    x: 1,
    y: 0
}, {
    x: 0,
    y: 1
}, {
    x: 1,
    y: 1
}, {
    x: 1,
    y: -1
}]);

//start = {x: val1, y: val2}
//goal  = {x: val3, y: val4}

function Astar(start, goal, obstacles) {
    //Set of nodes already evaluated
    var closedSet = [];

    //The set of currently discovered nodes that not evaluated yet.
    //Initially, only the start node is known.
    var openSet = [start];

    //For each node, which node it can most efficiently be reached from.
    //If a node can be reached from many nodes, cameFrom will eventually contain the
    //most efficient previous step.
    var cameFrom = new Map();

    function cameFromSet(id, val) {
        cameFrom[JSON.stringify(id)] = val;
    }

    // For each node, the cost of getting from the start node to that node
    //gScore := map with default value of Infinity
    var gScore = new Map();

    function gScoreGet(id) {
        if (gScore[JSON.stringify(id)] == undefined) {
            return Infinity;
        } else {
            return gScore[JSON.stringify(id)];
        }
    }

    function gScoreSet(id, val) {
        gScore[JSON.stringify(id)] = val;
    }
    //For each node, the total cost of getting from the start node to the goal
    //by passing by that node. That value is partly known, partly heuristic.
    var fScore = new Map();

    function fScoreGet(id) {
        if (fScore[JSON.stringify(id)] == undefined) {
            return Infinity;
        } else {
            return fScore[JSON.stringify(id)];
        }
    }

    function fScoreSet(id, val) {
        fScore[JSON.stringify(id)] = val;
    }

    var test = new heap(fScoreGet);
    test.push(start);


    //The cost of going from start to start is zero.

    gScoreSet(start, 0);


    //For the first node, the value is completely heuristic.
    fScoreSet(start, heuristic_cost_estimate(start, goal));

    //returns the cord with minimum fScore
    function min(array) {
        var min = null;
        array.forEach(function(cord) {
            if ((min == null) || (fScoreGet(min) > fScoreGet(cord))) {
                min = cord;
            }
        });
        return min;
    }

    Array.prototype.remove = function() {
        var what, a = arguments,
            L = a.length,
            ax;
        while (L && this.length) {
            what = a[--L];
            while ((ax = this.indexOf(what)) !== -1) {
                this.splice(ax, 1);
            }
        }
        return this;
    };

    function getNeighbors(current, obstacles) {
        var neighbors = [];
        var x = current.x;
        var y = current.y;

        var possibilites = [{
            x: x - 1,
            y: y - 1
        }, {
            x,
            y: y - 1
        }, {
            x: x + 1,
            y: y - 1
        }, {
            x: x + 1,
            y
        }, {
            x: x + 1,
            y: y + 1
        }, {
            x,
            y: y + 1
        }, {
            x: x - 1,
            y: y + 1
        }, {
            x: x - 1,
            y
        }];

        return _.differenceWith(possibilites, obstacles, _.isEqual);

        //return neighbors;
    }

    function heuristic_cost_estimate(start, goal) {
        // var dx = Math.abs(goal.x - start.x);
        // var dy = Math.abs(goal.y - start.y);
        //return dx + dy;

        var dx = Math.pow(start.x - goal.x, 2);
        var dy = Math.pow(start.y - goal.y, 2);
        return Math.sqrt(dx + dy);
    }

    function dist_between(current, neighbor) {
        //return Math.abs(current.x - neighbor.x) + Math.abs(current.y - neighbor.x);
        //return Math.sqrt(Math.pow((neighbor.x - current.x), 2) + Math.pow((neighbor.y - current.y), 2));
        return 1;
    }

    while (openSet.length > 0) {
        //the node in openSet having the lowest fScore[] value
        var current = min(openSet);
        if (current.x == goal.x && current.y == goal.y) {
            return reconstruct_path(cameFrom, current);
        }
        openSet.remove(current);
        closedSet.push(current);

        var neighbors = getNeighbors(current, obstacles);
        neighbors.forEach(function(neighbor) {

            if (_.filter(closedSet, function(o) {
                    return o.x == neighbor.x && o.y == neighbor.y;
                }).length > 0) {
                //Ignore the neighbor which is already evaluated.
                return;
            }
            if (_.filter(closedSet, function(o) {
                    return o.x == neighbor.x && o.y == neighbor.y;
                }) == 0) {
                //Discover a new node
                openSet.push(neighbor);
            }

            //The distance from start to a neighbor
            tentative_gScore = gScoreGet(current) + dist_between(current, neighbor);
            if (tentative_gScore >= gScoreGet(neighbor)) {
                //This is not a better path
                return;
            }
            //This path is the best until now, record it!
            cameFromSet(neighbor, current);
            gScoreSet(neighbor, tentative_gScore);
            fScoreSet(neighbor, gScoreGet(neighbor) + heuristic_cost_estimate(neighbor, goal));
            // cameFrom[neighbor] = current;
            // gScore[neighbor] = tentative_gScore;
            // fScore[neighbor] = gScoreGet(neighbor) + heuristic_cost_estimate(neighbor, goal);
        });
    }
    return null;

    function reconstruct_path(cameFrom, current) {
        var total_path = [current];
        while (cameFrom[JSON.stringify(current)] != undefined) {
            current = cameFrom[JSON.stringify(current)];
            total_path.push(current);
        }
        console.log(total_path);
    }
}