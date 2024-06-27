var focus_circle = false;
var focus_line = false;
var focus_rect = "";
var rect_type = false;
var Type = "";
var adjust_graph = false;
var createNewLine = false;
let isTrans = 0;
let islLoadTest = 0;
var selectRect;
var startRectvalue = [-1, -1, -1, -1];
var startPoint = [-1, -1, -1, -1, -1];
var RelRectvalue = [];
var selectedDir = 7;

var checkSelectedEdge = 0;
var selectedEdgePoint = [-1, -1]
var changeSelectedEdgeStatus = 0
var xx1;
var yy1;
var xx2;
var yy2;


var houseCoords = [];
var hc = [];
var houseCoordsCheck = [];

//biến vẽ ranh giới nhà
var checkDrawNewBoundary = 0;
var doorDrawn = false; // Biến kiểm tra xem cửa đã được chọn hay chưa
let idx = 0;
var boundary = ";"
var doorIdx = 0;



//biến thêm cửa cho các phòng
var addDoor = false;
var checkAddDoor = false;
var leftLayout;
var leftLayoutEdge;

var roomsInfo = []; // tọa độ của các phòng
var doorsInfo = []; //danh sách các cửa
var fnDoorInfor = []
var numDoor = 0;
var lengthL_1 = 0;
var lengthL_2 = 0;
var count = 0;

//kích thước cửa
var doorSize = 5;

//kiểm tra đã bấm transfer
var checkTransfer = 0;



$(document).ready(function () {
    start();//执行函数
    isTrans = 0;

});

function show(isShow) {
    // document.getElementById("rmlist").style.opacity = isShow;
    // document.getElementById("gooey-API").style.opacity = isShow;
    var selectedDir = 7
    document.getElementById("leftbox").style.opacity = isShow;
    document.getElementById("rightbox").style.opacity = isShow;
    document.getElementById("listbox").style.opacity = isShow;
    document.getElementById("graphSearch").style.opacity = isShow;
    document.getElementById("Editing").style.opacity = isShow;

    document.getElementById("BedRoomVue").style.opacity = isShow;
    document.getElementById("BathRoomVue").style.opacity = isShow;
    document.getElementById("otherVue").style.opacity = isShow;
    document.getElementById("detailVue").style.opacity = isShow;
    document.getElementById("addVue").style.opacity = isShow;

}

$(document).ready(function () {
    show(0.0)
    setTimeout("show(1.0)", 12000)
    //load the start
    demo.init();
});

function start() {
    var selectedDir = 7
    var leftsvg = document.getElementById('LeftGraphSVG');
    leftsvg.oncontextmenu = function () {
        return false;
    }

    $('#LeftGraphSVG').on('mousedown',
        function (e) {

            console.log("Left!");

            let selectX = e.clientX - leftsvg.getBoundingClientRect().left;
            let selectY = e.clientY - leftsvg.getBoundingClientRect().top;

            var roomSelect = -1;

            var arr, reg = new RegExp("(^| )ifSelectRoom=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg)) {
                roomSelect = arr[2];
            } else {
                roomSelect = 0;
            }

            if (roomSelect == 1) {
                clearHighLight();

                var curRoom = "NULL";
                var curIndex = -1;

                arr, reg = new RegExp("(^| )RoomType=([^;]*)(;|$)");

                if (arr = document.cookie.match(reg)) {
                    curRoom = arr[2];
                }

                arr, reg = new RegExp("(^| )CurNum=([^;]*)(;|$)");

                if (arr = document.cookie.match(reg)) {
                    curIndex = arr[2];
                }
                let id = "TransCircle_" + curIndex + "_" + curRoom;
                // if (isTrans == 0) {
                //     document.getElementById("graphSearch").style = "display:flex;cursor: default;color: #000;text-align: center;vertical-align: middle;line-height: 26px;position: absolute;margin-left: 160px;"
                //
                // }
                CreateCircle(selectX / 2, selectY / 2, id);
                d3.select("body").select("#LeftGraphSVG").select("#" + id).attr('scalesize', 1);
                document.cookie = "ifSelectRoom=0";
                document.cookie = "RoomNum=" + (parseInt(curIndex) + 1)
            }
        },

    )
    $('#draw').on('click', function () {
        doorDrawn = false
        let countDoor = 0
        d3.select('body').select('#LeftBaseSVGDraw').selectAll('line').remove();
        var leftsvgdraw = document.getElementById('LeftBaseSVGDraw');
        houseCoords = []
        if (checkDrawNewBoundary == 0) {
            houseCoords = []
            checkDrawNewBoundary = -1;
            $('#btnDrawDoor').on('click', function () {
                doorDrawn = true;
                //thêm cửa
                $('#LeftBaseSVGDraw').on('click', function (e) {
                    countDoor += 1
                    let x = e.clientX - leftsvgdraw.getBoundingClientRect().left;
                    let y = e.clientY - leftsvgdraw.getBoundingClientRect().top;
                    //houseCoords.pop();

                    // Thêm điểm mới cho cửa
                    var nearestEdge = findNearestEdge(x, y);
                    //if (nearestEdge != null) {
                    // Thêm điểm mới cho cửa
                    if (countDoor == 1) {
                        var lent = houseCoords.length;
                        if (houseCoords[lent - 2].y == houseCoords[lent - 1].y) {
                            var res = (houseCoords[lent - 1].x + houseCoords[0].x) / 2;
                            houseCoords[lent - 1].x = res;
                            houseCoords[0].x = res;
                        }
                        if (houseCoords[lent - 2].x == houseCoords[lent - 1].x) {
                            var res = (houseCoords[lent - 1].y + houseCoords[0].y) / 2;
                            houseCoords[lent - 1].y = res;
                            houseCoords[0].y = res;
                        }
                    }
                    houseCoords.push({ x: nearestEdge.x, y: nearestEdge.y });
                    updateHouseCoordsCheck()
                    drawHouse();
                })

            })
            $('#btnDrawBoundary').on('click', function () {
                if (!doorDrawn) {
                    $('#LeftBaseSVGDraw').on('click',
                        function (e) {
                            if (!doorDrawn) {
                                let x = e.clientX - leftsvgdraw.getBoundingClientRect().left;
                                let y = e.clientY - leftsvgdraw.getBoundingClientRect().top;
                                var newCoord = { x: x, y: y };
                                if (houseCoords.length > 0) {
                                    var lastCoord = houseCoords[houseCoords.length - 1];
                                    var dx = Math.abs(newCoord.x - lastCoord.x);
                                    var dy = Math.abs(newCoord.y - lastCoord.y);

                                    if (dx > dy) {
                                        newCoord.y = lastCoord.y;
                                    } else {
                                        newCoord.x = lastCoord.x;
                                    }
                                }
                                houseCoords.push(newCoord);
                                drawHouse();
                            }
                        })
                }
                //thêm boundary


            })

            $('#btnDone').on('click', function () {
                if (checkDrawNewBoundary == -1) {
                    for (let i = 0; i < houseCoords.length; i++) {
                        houseCoords[i].x = houseCoords[i].x / 2
                        houseCoords[i].y = houseCoords[i].y / 2
                    }
                    checkDrawNewBoundary = 0
                    var canvas = document.getElementById('canvas');
                    var ctx = canvas.getContext('2d');

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.lineWidth = 5;

                    // Vẽ ranh giới tòa nhà
                    if (!doorDrawn) {
                        ctx.beginPath();
                        ctx.moveTo(houseCoords[0].x, houseCoords[0].y);
                        for (let i = 1; i < houseCoords.length; i++) {
                            ctx.lineTo(houseCoords[i].x, houseCoords[i].y);
                        }
                        ctx.closePath();
                        ctx.stroke();
                    }
                    // Vẽ cửa (nếu đã được vẽ)
                    if (doorDrawn) {
                        ctx.beginPath();
                        ctx.moveTo(houseCoords[0].x, houseCoords[0].y);
                        for (let i = 1; i < houseCoords.length - 1; i++) {
                            ctx.lineTo(houseCoords[i].x, houseCoords[i].y);
                        }
                        ctx.closePath();
                        ctx.stroke();

                        var doorCoord = houseCoords[houseCoords.length - 1];
                        ctx.fillStyle = "#e3e38d";
                        ctx.fillRect(doorCoord.x, doorCoord.y - 2, 25, 7);
                    }
                    //done

                    arrangeVertices(idx);
                    findEdgeDirection()
                    fixDoor()
                    //save_new_data()

                    let imageData = canvas.toDataURL('image/png');
                    var formData = new FormData();
                    formData.append('imageData', imageData);
                    formData.append('imageName', "example.png")

                    fetch("/index/save_canvas_image/", {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': '{{ csrf_token }}'
                        },
                        body: formData,

                    })
                        .then(response => response.text())
                        .then(data => {
                            console.log(data);
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                    for (let i = 0; i < houseCoords.length; i++) {
                        boundary += houseCoords[i].x + ',' + houseCoords[i].y + ',' + houseCoords[i].dir + ',' + houseCoords[i].isNew + ';';
                    }
                    boundary = boundary.slice(1, boundary.length - 1)
                    var formData = new FormData();
                    formData.append('boundary', boundary);

                    fetch("/index/save_new_data/", {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': '{{ csrf_token }}'
                        },
                        body: formData
                    })
                        .then(response => response.text())
                        .then(data => {
                            console.log(data);
                        })
                        .then(data => {
                            LoadTestBoundary('canvas_converted.png')
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }
            })
        }

    })

    console.time('time');

    var model = 1;
    $.get("/index/Init/", { 'start': model.toString() }, function () {
        console.log("load model success");
        console.timeEnd('time')

    })
    animateHeight(true);
    animateHeight1(true);
    animateHeight2(true);
    animateHeight3(true);
    animateHeight4(true);
}
//draw
function findNearestEdge(x, y) {
    var nearestEdge = null;
    var minDistance = 1;

    for (let i = 0; i < houseCoords.length; i++) {
        var coord1 = houseCoords[i];
        var coord2 = houseCoords[(i + 1) % houseCoords.length];

        var distance = pointToLineDistance(x, y, coord1.x, coord1.y, coord2.x, coord2.y);
        if (i == 0) {
            minDistance = distance;
        }
        if (distance < minDistance) {
            minDistance = distance;
            idx = i
            nearestEdge = getNearestPointOnLine(x, y, coord1.x, coord1.y, coord2.x, coord2.y);
            doorIdx = i;
        }
    }
    return nearestEdge;
}

function pointToLineDistance(x, y, x1, y1, x2, y2) {
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) // in case of 0 length line
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    var dx = x - xx;
    var dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function getNearestPointOnLine(x, y, x1, y1, x2, y2) {
    var A = x - x1;
    var B = y - y1;
    var C = x2 - x1;
    var D = y2 - y1;

    var dot = A * C + B * D;
    var len_sq = C * C + D * D;
    var param = -1;
    if (len_sq != 0) // in case of 0 length line
        param = dot / len_sq;

    var xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    return { x: xx, y: yy };
}

// hàm cập nhật tọa độ của houseCoords theo thứ tự thực tế vào houseCoordsCheck
function updateHouseCoordsCheck() {
    houseCoordsCheck = [].concat(houseCoords[houseCoords.length - 1])
    houseCoordsCheck = houseCoordsCheck.concat(houseCoords.slice((doorIdx + 1) % houseCoords.length, houseCoords.length - 1))
    houseCoordsCheck = houseCoordsCheck.concat(houseCoords.slice(0, doorIdx + 1))
}


function drawHouse() {
    d3.select('body').select('#LeftBaseSVGDraw').selectAll('line').remove();

    var fontdoor_color = roomcolor("Front door");
    var exterior_wall = roomcolor("Exterior wall");
    var border = 4;
    // Vẽ ranh giới tòa nhà
    if (!doorDrawn) {
        if (houseCoords.length == 1) {
            d3.select('body').select('#LeftBaseSVGDraw').append('circle')
                .attr("cx", houseCoords[0].x)
                .attr("cy", houseCoords[0].y)
                .attr("r", 4)
                .attr("fill", "red");
        }
        for (let i = 0; i < houseCoords.length; i++) {
            d3.select('body').select('#LeftBaseSVGDraw').append('line')
                .attr("x1", houseCoords[i].x)
                .attr("y1", houseCoords[i].y)
                .attr("x2", houseCoords[(i + 1) % houseCoords.length].x)
                .attr("y2", houseCoords[(i + 1) % houseCoords.length].y)
                .attr("stroke", exterior_wall)
                .attr("stroke-width", border);
        }
    }
    // Vẽ cửa (nếu đã được vẽ)
    if (doorDrawn) {
        for (let i = 0; i < houseCoords.length - 1; i++) {
            let i1 = i
            let i2 = (i + 1) % (houseCoords.length - 1)
            d3.select('body').select('#LeftBaseSVGDraw').append('line')
                .attr("x1", houseCoords[i1].x)
                .attr("y1", houseCoords[i1].y)
                .attr("x2", houseCoords[i2].x)
                .attr("y2", houseCoords[i2].y)
                .attr("stroke", exterior_wall)
                .attr("stroke-width", border);
        }
        d3.select('body').select('#LeftBaseSVGDraw').append('line')
            .attr("x1", houseCoords[houseCoords.length - 1].x)
            .attr("y1", houseCoords[houseCoords.length - 1].y)
            .attr("x2", houseCoords[houseCoords.length - 1].x - doorSize)
            .attr("y2", houseCoords[houseCoords.length - 1].y)
            .attr("stroke", fontdoor_color)
            .attr("stroke-width", border);
    }
}
//Nút done
function arrangeVertices(idx) {
    let idx1 = houseCoords[idx];
    let idx2 = houseCoords[(idx + 1) % houseCoords.length];
    if (idx1.x == idx2.x) {
        if (houseCoords[idx].y < houseCoords[(idx + 1) % houseCoords.length].y) {
            houseCoords = [].concat(
                //houseCoords[houseCoords.length-1],
                houseCoords[houseCoords.length - 1],
                houseCoords.slice(0, idx + 1).reverse(),
                houseCoords.slice((idx + 1) % houseCoords.length, houseCoords.length - 1),
            );
        } else {
            houseCoords = [].concat(
                //houseCoords[houseCoords.length-1],
                houseCoords[houseCoords.length - 1],
                houseCoords.slice(0, idx + 1).reverse(),
                houseCoords.slice((idx + 1) % houseCoords.length, houseCoords.length - 1).reverse(),
            );
        }
        //houseCoords[0].x -=2;
        //houseCoords[1].x +=2;
    } else if (idx1.y == idx2.y) {
        if (houseCoords[idx].x < houseCoords[(idx + 1) % houseCoords.length].x) {
            houseCoords = [].concat(
                //houseCoords[houseCoords.length-1],
                houseCoords[houseCoords.length - 1],
                houseCoords.slice(0, idx + 1).reverse(),
                houseCoords.slice((idx + 1) % houseCoords.length, houseCoords.length - 1).reverse(),
            );
        } else {
            houseCoords = [].concat(
                //houseCoords[houseCoords.length-1],
                houseCoords[houseCoords.length - 1],
                houseCoords.slice(0, idx + 1).reverse(),
                houseCoords.slice((idx + 1) % houseCoords.length, houseCoords.length - 1).reverse(),
            );
        }
        //houseCoords[0].x -=2;
        //houseCoords[1].x +=2;
    }
}

//Tìm hướng cạnh cho cột 3
function findEdgeDirection() {
    //result.innerHTML += ' hướng cạnh : ';
    var fX = houseCoords.length - 1;
    for (let i = 1; i < (houseCoords.length); i++) {
        if (houseCoords[i].y > houseCoords[fX].y) {
            fX = i;
        }
    }
    //result.innerHTML += (' fX: ' + fX);
    //result.innerHTML += (' fX: ' + (fX - 2 + houseCoords.length) % houseCoords.length);
    if (houseCoords[fX].y == houseCoords[(fX - 2 + houseCoords.length) % houseCoords.length].y) {
        fX = (fX - 2 + houseCoords.length) % (houseCoords.length);
        //result.innerHTML += (' fX: ' + fX);
    }
    var check = [];
    let idx = 0;
    for (let i = 0; i < houseCoords.length - fX; i++) {
        check[i] = fX + i;
        idx++;
    }
    for (let i = 1; i < fX; i++) {
        check[idx] = i;
        idx++;
    }
    /*for (let i = 0; i < check.length; i++) {
      result.innerHTML += check[i]
    }*/
    var checkDir = new Array(houseCoords.length).fill(-1);
    var dir = 2;
    for (let i = 0; i < check.length; i++) {
        //result.innerHTML += ('<br> checkDir : ' + check[((i + 1) % check.length)] + ' ' + check[(i + 2) % check.length]);
        var dir2 = findDir(dir, check[(i + 1) % check.length], check[(i + 2) % check.length]);
        if (dir2 == 1 || dir2 == 3) {
            checkY(dir, dir2, check[(i + 1) % check.length], check[(i + 2) % check.length], checkDir);
        } else {
            checkX(dir, dir2, check[(i + 1) % check.length], check[(i + 2) % check.length], checkDir)
        }
        //result.innerHTML += ('dir ' + dir + 'dir2' + dir2)
        dir = dir2;
    }
    addDir(checkDir);
}

function addDir(checkDir) {
    var tempCoords = [];
    for (let i = 0; i < houseCoords.length; i++) {
        //result.innerHTML += "<br>addDỉr" + houseCoords.length;
        var newCoord = { x: houseCoords[i].x, y: houseCoords[i].y, dir: 1, isNew: 1 };
        //result.innerHTML += "<br>addDỉr";
        newCoord.x = Math.ceil(houseCoords[i].x);
        newCoord.y = Math.ceil(houseCoords[i].y);
        //result.innerHTML += "<br>addDỉr";
        if (i == 0) {
            newCoord.dir = checkDir[houseCoords.length - 1];
            newCoord.isNew = 1;
        } else {
            newCoord.dir = checkDir[i];
            newCoord.isNew = 0;
        }
        tempCoords.push(newCoord);
    }
    houseCoords = tempCoords;
}

function findDir(dir, v1, v2) {
    if (dir == 0) {
        if (houseCoords[v1].y < houseCoords[v2].y) {
            return 1;
        } else {
            return 3;
        }
    }
    if (dir == 1) {
        if (houseCoords[v1].x > houseCoords[v2].x) {
            return 2;
        } else {
            return 0;
        }
    }
    if (dir == 2) {
        if (houseCoords[v1].y < houseCoords[v2].y) {
            return 1;
        } else {
            return 3;
        }
    }
    if (dir == 3) {
        if (houseCoords[v1].x < houseCoords[v2].x) {
            return 0;
        } else {
            return 2;
        }
    }
}

function checkY(dir, dir2, v1, v2, checkDir) {
    if ((dir == 0 && dir2 == 1) || (dir == 0 && dir2 == 3) || (dir == 2 && dir2 == 1)) {
        checkDir[v1] = dir2;
    } else {
        if (houseCoords[v1].y > houseCoords[v2].y && checkDir[v1] == -1) {
            checkDir[v1] = dir2
        }
        if (houseCoords[v1].y < houseCoords[v2].y && checkDir[v2] == -1) {
            checkDir[v2] = dir2
        }
    }
}
function checkX(dir, dir2, v1, v2, checkDir) {
    if ((dir == 3 && dir2 == 0) || (dir == 1 && dir2 == 0)) {
        checkDir[v1] = dir2;
    } else {
        if (houseCoords[v1].x > houseCoords[v2].x && checkDir[v1] == -1) {
            checkDir[v1] = dir2
        }
        if (houseCoords[v1].x < houseCoords[v2].x && checkDir[v2] == -1) {
            checkDir[v2] = dir2
        }
    }
}

function fixDoor() {
    temp = { x: houseCoords[0].x, y: houseCoords[0].y, dir: houseCoords[0].dir, isNew: houseCoords[0].isNew }
    houseCoords = [].concat(temp, houseCoords)

    if (houseCoords[0].x == houseCoords[2].x) {
        houseCoords[1].y = houseCoords[1].y + 2;
        houseCoords[0].y = houseCoords[0].y - 2;
    } else if (houseCoords[0].y == houseCoords[2].y) {

        houseCoords[1].x = houseCoords[1].x - 2;
        houseCoords[0].x = houseCoords[0].x + 2
    }
}

//chọn cửa
function findTwoRoomOfDoor1(id, x, y) {
    let distanceDoortoRoom = []
    let position = []
    let sumDistance = []
    for (let i = 0; i < leftLayout.length; i++) {
        position.push(getNearestPointOnLine(x, y, leftLayout[i][0][0], leftLayout[i][0][1], leftLayout[i][0][0], leftLayout[i][0][3]))
        let distance1 = pointToLineDistance(x, y, leftLayout[i][0][0], leftLayout[i][0][1], leftLayout[i][0][0], leftLayout[i][0][3])
        let checkDistanceDoor = pointToLineDistance(x, y, leftLayout[i][0][0], leftLayout[i][0][1], leftLayout[i][0][2], leftLayout[i][0][1])
        if (distance1 > checkDistanceDoor) {
            distance1 = checkDistanceDoor
            position[i] = getNearestPointOnLine(x, y, leftLayout[i][0][0], leftLayout[i][0][1], leftLayout[i][0][2], leftLayout[i][0][1])
        }
        checkDistanceDoor = pointToLineDistance(x, y, leftLayout[i][0][0], leftLayout[i][0][3], leftLayout[i][0][2], leftLayout[i][0][3])
        if (distance1 > checkDistanceDoor) {
            distance1 = checkDistanceDoor
            position[i] = getNearestPointOnLine(x, y, leftLayout[i][0][0], leftLayout[i][0][3], leftLayout[i][0][2], leftLayout[i][0][3])
        }
        checkDistanceDoor = pointToLineDistance(x, y, leftLayout[i][0][2], leftLayout[i][0][1], leftLayout[i][0][2], leftLayout[i][0][3])
        if (distance1 > checkDistanceDoor) {
            distance1 = checkDistanceDoor
            position[i] = getNearestPointOnLine(x, y, leftLayout[i][0][2], leftLayout[i][0][1], leftLayout[i][0][2], leftLayout[i][0][3])
        }
        distanceDoortoRoom.push(distance1)
    }
    for (let i = 0; i < leftLayoutEdge.length; i++) {
        sumDistance.push(distanceDoortoRoom[leftLayoutEdge[i][0]] + distanceDoortoRoom[leftLayoutEdge[i][1]])
    }
    let indexedArray = sumDistance.map((value, index) => ({ value, index }));

    // Sắp xếp mảng theo giá trị tăng dần
    indexedArray.sort((a, b) => a.value - b.value);

    // Lấy mảng sau khi sắp xếp
    let sortedValues = indexedArray.map(item => item.value);

    // Lấy vị trí của mảng ban đầu sau khi sắp xếp
    let originalIndex = indexedArray.map(item => item.index);

    let result = []
    result.push(originalIndex[0])
    result.push(originalIndex[1])
    result.push(position[originalIndex[0]])
    return result
}

function findTwoRoomOfDoor(id, x, y) {
    var parts = id.split('_');
    var number = parseInt(parts[1]);
    let idxRoom;
    let idxEdge;
    let idxLivingRoom;
    let xy;
    for (let i = 0; i < roomsInfo.length; i++) {
        if (number == roomsInfo[i][2]) {
            idxRoom = i;
        }
        if (roomsInfo[i][1][0] == 'LivingRoom') idxLivingRoom = i;
    }
    let xMin = roomsInfo[idxRoom][0][0]
    let yMin = roomsInfo[idxRoom][0][1]
    let xMax = roomsInfo[idxRoom][0][2]
    let yMax = roomsInfo[idxRoom][0][3]
    let distance = pointToLineDistance(x, y, xMin, yMin, xMax, yMin)
    idxEdge = 0; //cạnh trên
    xy = getNearestPointOnLine(x, y, xMin, yMin, xMax, yMin)
    let distance1 = pointToLineDistance(x, y, xMax, yMin, xMax, yMax)
    if (distance1 < distance) {
        idxEdge = 1 //cạnh phải
        distance = distance1
        xy = getNearestPointOnLine(x, y, xMax, yMin, xMax, yMax)
    }
    distance1 = pointToLineDistance(x, y, xMax, yMax, xMin, yMax)
    if (distance1 < distance) {
        idxEdge = 2 //cạnh dưới
        distance = distance1
        xy = getNearestPointOnLine(x, y, xMax, yMax, xMin, yMax)
    }
    distance1 = pointToLineDistance(x, y, xMin, yMax, xMin, yMin)
    if (distance1 < distance) {
        idxEdge = 3 //cạnh trái
        distance = distance1
        xy = getNearestPointOnLine(x, y, xMin, yMax, xMin, yMin)
    }
    x = xy.x
    y = xy.y
    let checkEdge = false;
    for (let i = 0; i < roomsInfo.length; i++) {
        if (idxEdge == 0) {
            if (y == roomsInfo[i, 0][0][3]) {
                if (x < roomsInfo[i, 0][0][3] && x > roomsInfo[i, 0][0][0]) {
                    let edge = [idxRoom, i, x, y]
                    doorsInfo.push(edge)
                    checkEdge = true;
                    break;
                }
            }
        } else if (idxEdge == 1) {
            if (x == roomsInfo[i, 0][0][0]) {
                if (y < roomsInfo[i, 0][0][3] && y > roomsInfo[i, 0][0][1]) {
                    let edge = [idxRoom, i, x, y]
                    doorsInfo.push(edge)
                    checkEdge = true;
                    break;

                }
            }

        } else if (idxEdge == 2) {
            if (y == roomsInfo[i, 0][0][3]) {
                if (x < roomsInfo[i, 0][0][3] && x > roomsInfo[i, 0][0][0]) {
                    let edge = [idxRoom, i, x, y]
                    doorsInfo.push(edge)
                    checkEdge = true;
                    break;
                }
            }
        } else {
            if (x == roomsInfo[i, 0][0][0]) {
                if (y < roomsInfo[i, 0][0][3] && y > roomsInfo[i, 0][0][1]) {
                    let edge = [idxRoom, i, x, y]
                    doorsInfo.push(edge)
                    checkEdge = true;
                    break;

                }
            }
        }
    }
    if (checkEdge == false) {
        let edge = [idxRoom, idxLivingRoom, x, y]
        doorsInfo.push(edge)
        checkEdge = true;
    }
    return xy;
}


//chọn cạnh
function selectedEdge() {
    if (checkSelectedEdge == 0) {
        checkSelectedEdge = 1;
        d3.select('body').select('#LeftBaseSVG').selectAll('line').remove();
        var arr, reg = new RegExp("(^| )hsname=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            hsname = arr[2];
        $.get("/index/selectDir/", { 'hsname': hsname }, function (ret) {
            var border = 4;
            var redNotice = roomcolor("redNotice")
            var fontdoor_color = roomcolor("Front door");
            var door = ret['door']
            door = door.split(",")
            var exterior = ret['exterior']
            let infoEdge = ret['infoEdge']
            exterior = exterior.split(" ")
            let lenex = exterior.length
            for (let i = 0; i < lenex; i++) {
                exterior[i] = exterior[i].split(",")
            }
            infoEdge = infoEdge.split(" ")
            let minDistance = 256;
            let idxE = 0;

            d3.select('body').select('#LeftBaseSVG').append('line')
                .attr("x1", parseInt(door[0]))
                .attr("y1", door[1])
                .attr("x2", door[2])
                .attr("y2", door[3])
                .attr("stroke", fontdoor_color)
                .attr("stroke-width", border);
            for (let i = 1; i < lenex - 1; i++) {
                if (Number(infoEdge[i]) == Number(selectedDir)) {
                    let i1 = i + 1
                    if (i1 === lenex - 1) {
                        i1 = 0;
                    }
                    var x1 = exterior[i][0]
                    var x2 = exterior[i1][0]
                    var y1 = exterior[i][1]
                    var y2 = exterior[i1][1]
                    var distance = distanceToLine(x1, y1, x2, y2)
                    if (distance < minDistance) {
                        idxE = i
                        minDistance = distance
                        xx1 = x1
                        xx2 = x2
                        yy1 = y1
                        yy2 = y2
                    }
                }
            }
            d3.select('body').select('#LeftBaseSVG').append('line')
                .attr("x1", xx1)
                .attr("y1", yy1)
                .attr("x2", xx2)
                .attr("y2", yy2)
                .attr("stroke", redNotice)
                .attr("stroke-width", border);
        });
    }
    else checkSelectedEdge = 0;
}

function distanceToLine(x1, y1, x2, y2) {
    let x0 = selectedEdgePoint[0]
    let y0 = selectedEdgePoint[1]
    let distance = 256;
    if (x1 == x2) {
        if (x1 > x0) distance = x1 - x0
        else distance = x0 - x1
    } else if (y1 == y2) {
        if (y1 > y0) distance = y1 - y0
        else distance = y0 - y1
    }

    return distance;
}

function addLivingRoom(BtnID) {//这个加点的
    var arr, reg = new RegExp("(^| )RoomNum=([^;]*)(;|$)");
    let id = -1;
    if (arr = document.cookie.match(reg))
        id = parseInt(arr[2]);
    var roomType = BtnID.split("_")[0];
    if (roomType == "BedRoom") {
        var Bedrandom = { 0: "MasterRoom", 1: "SecondRoom", 2: "GuestRoom", 3: "ChildRoom", 4: "StudyRoom" };
        var rand = Math.random() * 5;

        roomType = Bedrandom[parseInt(rand)];
    }

    selectRoomType(roomType, id);
}

function clearHighLight() {
    var points = d3.select("body").select("#LeftGraphSVG").selectAll("circle").attr("stroke-width", 2);
}

function rect_clearHighLight() {
    var rects = d3.select("body").select("#LeftLayoutSVG").selectAll("rect").attr("stroke-width", 4);

}

function selectRoomType(roomType, id) {
    document.cookie = "RoomType=" + roomType;
    document.cookie = "ifSelectRoom=1";
    document.cookie = "CurNum=" + id;
    // document.cookie = "CurNum=" + id.split("_")[1];
    var arr, reg = new RegExp("(^| )ifSelectRoom=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        console.log(arr[2]);
}


var selectDir = function (dir) {
    selectedDir = dir;
    var leftsvg = document.getElementById('LeftGraphSVG');
    leftsvg.oncontextmenu = function () {
        return false;
    }
    d3.select('body').select('#LeftBaseSVG').selectAll('line').remove();
    var arr, reg = new RegExp("(^| )hsname=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        hsname = arr[2];
    $.get("/index/selectDir/", { 'hsname': hsname }, function (ret) {
        var border = 4;
        var redNotice = roomcolor("redNotice")
        var fontdoor_color = roomcolor("Front door");
        var door = ret['door']
        door = door.split(",")
        var exterior = ret['exterior']
        let infoEdge = ret['infoEdge']
        exterior = exterior.split(" ")
        let lenex = exterior.length
        for (let i = 0; i < lenex; i++) {
            exterior[i] = exterior[i].split(",")
        }
        infoEdge = infoEdge.split(" ")
        d3.select('body').select('#LeftBaseSVG').append('line')
            .attr("x1", parseInt(door[0]))
            .attr("y1", door[1])
            .attr("x2", door[2])
            .attr("y2", door[3])
            .attr("stroke", fontdoor_color)
            .attr("stroke-width", border);
        for (let i = 1; i < lenex - 1; i++) {
            if (Number(infoEdge[i]) == Number(dir)) {
                let i1 = i + 1
                if (i1 === lenex - 1) {
                    i1 = 0;
                }
                var x1 = exterior[i][0]
                var x2 = exterior[i1][0]
                var y1 = exterior[i][1]
                var y2 = exterior[i1][1]

                d3.select('body').select('#LeftBaseSVG').append('line')
                    .attr("x1", x1)
                    .attr("y1", y1)
                    .attr("x2", x2)
                    .attr("y2", y2)
                    .attr("stroke", redNotice)
                    .attr("stroke-width", border);
            }
        }
    })
    $('#LeftGraphSVG').on('click', function (e) {
        let selectX = e.clientX - leftsvg.getBoundingClientRect().left;
        let selectY = e.clientY - leftsvg.getBoundingClientRect().top;
        if (changeSelectedEdgeStatus == 0) {
            selectedEdgePoint[0] = Math.ceil(selectX / 2)
            selectedEdgePoint[1] = Math.ceil(selectY / 2)
        }
        if (changeSelectedEdgeStatus == 0)
            selectedEdge()
    })
    $('#selectedEdge').on('click', function () {
        if (changeSelectedEdgeStatus === 0) changeSelectedEdgeStatus = 1
        else changeSelectedEdgeStatus = 0
    });
}

var checkDir = function () {
    NumSearch(selectedDir)
}

function init() {
    var selectedDir = 7
    d3.select('body').select('#RightSVG').selectAll('line').remove();
    d3.select('body').select('#RightSVG').selectAll('circle').remove();

    d3.select('body').select('#RightLayoutSVG').selectAll('line').remove();
    d3.select('body').select('#RightLayoutSVG').selectAll('circle').remove();
    d3.select('body').select('#RightLayoutSVG').selectAll('rect').remove();
    d3.select('body').select('#RightLayoutSVG').selectAll('polygon').remove();
    d3.select('body').select('#RightLayoutSVG').selectAll('clipPath').remove();

    // d3.select('body').select('#LeftGraphSVG').selectAll('.TransLine').remove();
    // d3.select('body').select('#LeftGraphSVG').selectAll('.TransCircle').remove();
    document.getElementById("graphSearch").style = "cursor: default;color: #000;text-align: center;vertical-align: middle;line-height: 26px;position: absolute;margin-left: 290px;";

    d3.select('body').select('#LeftLayoutSVG').selectAll('rect').remove();
    d3.select('body').select('#LeftLayoutSVG').selectAll('polygon').remove();
    d3.select('body').select('#LeftLayoutSVG').selectAll('clipPath').remove();
    d3.select('body').select('#LeftLayoutSVG').selectAll('g').remove();

}

function RightInit() {
    d3.select('body').select('#RightSVG').selectAll('line').remove();
    d3.select('body').select('#RightSVG').selectAll('circle').remove();
    d3.select('body').select('#RightLayoutSVG').selectAll('line').remove();
    d3.select('body').select('#RightLayoutSVG').selectAll('circle').remove();
    d3.select('body').select('#RightLayoutSVG').selectAll('rect').remove();
    d3.select('body').select('#RightLayoutSVG').selectAll('polygon').remove();
    d3.select('body').select('#RightLayoutSVG').selectAll('clipPath').remove();

}
function showCoordinates(event) {
    var x = event.clientX;
    var y = event.clientY;
    // Hoặc hiển thị tọa độ trong một phần tử HTML khác
    // document.getElementById("coordinates").innerHTML = "Tọa độ: " + x + ", " + y;
}

function ListBox(ret, rooms) {
    var roomList = ret;
    var hsList = document.getElementById('hsList');
    while (hsList.hasChildNodes()) {
        hsList.removeChild(hsList.firstChild);
    }
    for (let i = roomList.length - 1; i >= 0; i--) {
        var hs = roomList[i];
        let itembt = document.createElement('button');
        itembt.innerHTML = ret[i].split(".")[0];
        itembt.classList.add('api-title');
        itembt.classList.add('pngls');
        itembt.id = "Btn_" + ret[i];
        let itemimg = document.createElement('img');
        // itemimg.src="../static/Data/Img/52.png";
        //             itemimg.src="../static/Data/snapshot/"+ret[i];
        itemimg.src = "../static/Data/snapshot_train/" + ret[i];
        itembt.appendChild(itemimg);
        itembt.onclick = function () {
            RightInit();
            var all = document.getElementsByClassName("api-text");
            let i;
            for (i = 0; i < all.length; i++) {
                all[i].style.border = "0px";
            }
            d3.select('body').select('#LeftBaseSVG').selectAll('rect').remove();
            var parent = this.parentNode;
            parent.style.border = "2px solid #BEECFF";
            // d3.select('body').select('#LeftLayoutSVG').selectAll("svg > *").remove();
            CreateRightImage(this.id.split("_")[1]);
            var Rightid = this.id.split("_")[1];
            document.getElementById("transfer").onclick = function () {
                checkTransfer = 1;
                //
                //vẽ vào ảnh 3d

                //
                d3.select('body').select('#LeftGraphSVG').selectAll('.TransLine').remove();
                d3.select('body').select('#LeftGraphSVG').selectAll('.TransCircle').remove();
                CreateLeftGraph(rooms, Rightid);
                // d3.select("body").select("#LeftGraphSVG").select("#" + roomid).attr('scalesize',1);
                document.getElementById("graphSearch").style = "display:none;cursor: default;color: #000;text-align: center;vertical-align: middle;line-height: 26px;position: absolute;margin-left: 160px;";
                isTrans = 1;
                document.getElementById("graphdiv").style = "display:block;cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 850px;";
                document.getElementById("layoutdiv").style = "display:block;cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 950px;";
            }
        }

        let itemdiv = document.createElement('div');
        itemdiv.classList.add('api-text');
        itemdiv.appendChild(itembt);

        let itemli = document.createElement('li');
        itemli.classList.add('col-sm-12');
        itemli.appendChild(itemdiv);
        hsList.insertBefore(itemli, hsList.firstChild);
    }
    console.time('time');
    // CreateRightImage(ret[0]);
    // ocument.getElementById("transfer").onclick = function () {
    //         CreateLeftGraph(rooms, ret[0]);}
    console.timeEnd('time')
}

function NumSearch(dir) {
    document.getElementById("graphdiv").style = "display:none;cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 850px;";
    document.getElementById("layoutdiv").style = "display:none;cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 950px;";

    d3.select('body').select('#LeftGraphSVG').selectAll('.TransLine').remove();
    d3.select('body').select('#LeftGraphSVG').selectAll('.TransCircle').remove();
    document.cookie = "RoomNum=0";
    init();
    d3.select('body').select('#LeftBaseSVG').selectAll('rect').remove();
    d3.select("body").select("#LeftLayoutSVG").selectAll(".windowsline").remove();
    d3.select("body").selectAll(".UserPoint").attr("fill", "#6bdb6a").attr("stroke", 0);
    var hsname = null;
    var arr, reg = new RegExp("(^| )hsname=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        hsname = arr[2];
    var points = d3.select('body').select('#LeftGraphSVG').selectAll('circle');

    var rooms = [];
    rooms.push(hsname);
    var obj = Num();
    rooms.push(obj.roomactarr);
    rooms.push(obj.roomexaarr);
    rooms.push(obj.roomnumarr);

    points.each(function (d, i) {
        var room = [];
        room.push(this.id);
        room.push(this.cx.animVal.value);
        room.push(this.cy.animVal.value);
        rooms.push(room);
    });

    $.get("/index/NumSearch/", { 'userInfo': JSON.stringify(rooms), 'dir': dir.toString() }, function (ret) {
        ListBox(ret, rooms);
    });
}


function roomcolor(rmcate) {
    switch (rmcate) {
        case "redNotice":
            var color = d3.rgb(255, 0, 0)
        case "LivingRoom":
            var color = d3.rgb(244, 242, 229)
            break;
        case "MasterRoom":
            var color = d3.rgb(253, 244, 171)
            break;
        case "Kitchen":
            var color = d3.rgb(234, 216, 214)
            break;
        case "Bathroom":
            var color = d3.rgb(205, 233, 252);
            break;
        case "DiningRoom":
            var color = d3.rgb(244, 242, 229);
            break;
        case "ChildRoom":
            var color = d3.rgb(253, 244, 171);
            break;
        case "StudyRoom":
            var color = d3.rgb(253, 244, 171);
            break;
        case "SecondRoom":
            var color = d3.rgb(253, 244, 171);
            break;
        case "GuestRoom":
            var color = d3.rgb(253, 244, 171);
            break;
        case "Balcony":
            var color = d3.rgb(208, 216, 135);
            break;
        case "Entrance":
            var color = d3.rgb(244, 242, 229);
            break;
        case "Storage":
            var color = d3.rgb(249, 222, 189);
            break;
        case "Wall-in":
            var color = d3.rgb(202, 207, 239);
            break;
        case "External area":
            var color = d3.rgb(255, 255, 255);
            break;
        case "Exterior wall":
            var color = d3.rgb(79, 79, 79);
            break;
        case "Front door":
            var color = d3.rgb(255, 225, 25);
            break;
        case "Interior wall":
            var color = d3.rgb(128, 128, 128);
            break;
        case "Interior door":
            var color = d3.rgb(255, 255, 255);
            break;
        case "inDoor":
            var color = d3.rgb(212, 1, 4);

        default:
            break
    }
    return color;
}

function CreateCircle(cx, cy, id, r) {
    if (r == undefined) {
        r = 5;
    }

    var title = id.split("_")[2];
    var circlecolor = roomcolor(title);
    d3.select('body').select('#LeftGraphSVG').append('circle')
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("fill", circlecolor)
        .attr("r", r)
        .attr("stroke", "#000000")
        .attr("stroke-width", 2)
        .attr("id", id)
        .attr("class", "TransCircle")
        .on("mousedown", circle_mousedown)
        .on("mousemove", circle_mousemove)
        .on("mouseup", circle_mouseup)
        .on("dblclick", circle_dblclick)
        .append("title")//此处加入title标签
        .text(title);
}

function CreateLine(x1, y1, x2, y2, id) {
    d3.select('body').select('#LeftGraphSVG').append('line')
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "#000000")
        .attr("stroke-width", "2px")
        .attr("id", id)
        .attr("class", "TransLine")
        .on("mousedown", line_mousedown)
        .on("mouseup", line_mouseup)
}


function LoadTestBoundary(files) {
    init();
    if (islLoadTest == 1) {
        document.getElementById("BedRoomlb").innerHTML = "BedRoom";
        document.getElementById("BathRoomlb").innerHTML = "BathRoom";
        document.getElementById("otherlb").innerHTML = "Other Room Types";
        document.getElementById("detailedlb").innerHTML = "Detailed Bedroom Types";
        document.getElementById("graphdiv").style = "display:none;cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 850px;";
        document.getElementById("layoutdiv").style = "display:none;cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 950px;";

        // initVue();
    }
    d3.select('body').select('#LeftBaseSVG').selectAll("svg > *").remove();
    d3.select('body').select('#LeftGraphSVG').selectAll("svg > *").remove();
    d3.select('body').select('#LeftLayoutSVG').selectAll("svg > *").remove();
    d3.select('body').select('#RightLayoutSVG').selectAll("svg > *").remove();
    d3.select('body').select('#RightSVG').selectAll("svg > *").remove();
    document.getElementById('hsList').innerHTML = "";
    d3.select('body').select('#LeftBaseSVG').selectAll('polygon').remove();
    d3.select('body').select('#LeftBaseSVG').selectAll('line').remove();

    let name = ''
    if (typeof files === 'string') {
        name = files
    } else {
        var file = files[0];
        name = file.name
    }
    document.cookie = "hsname=" + name;
    $.get("/index/LoadTestBoundary", { 'testName': name }, function (ret) {
        var border = 4;
        islLoadTest = 1;
        var hsex = ret['exterior'];
        //var doorCoord = houseCoords[0];
        //ctx.fillStyle = "#e3e38d";
        //ctx.fillRect(doorCoord.x, doorCoord.y - 2, 15, 7);



        d3.select("#LeftBaseSVG")
            .append("polygon")
            .attr("points", hsex)
            .attr("fill", "none")
            .attr("stroke", roomcolor("Exterior wall"))
            .attr("stroke-width", border);

        /*d3.select("#LeftBaseSVGDraw")
            .append("polygon")
            .attr("points", hsex)
            .attr("fill", "none")
            .attr("stroke", roomcolor("Exterior wall"))
            .attr("stroke-width", border);*/
        d3.select("#LeftBaseSVG")
            .append("polygon")
            .attr("points", hsex)
            .attr("fill", "none")
            .attr("stroke", roomcolor("Exterior wall"))
            .attr("stroke-width", border);
        var fontdoor_color = roomcolor("Front door");

        var door = ret['door'].split(",");
        d3.select('body').select('#LeftBaseSVG').append('line')
            .attr("x1", parseInt(door[0]))
            .attr("y1", door[1])
            .attr("x2", door[2])
            .attr("y2", door[3])
            .attr("stroke", fontdoor_color)
            .attr("stroke-width", border);

    })
    d3.select('body').select('#LeftBaseSVG').attr("transform", "scale(2)");
    d3.select('body').select('#LeftGraphSVG').attr("transform", "scale(2)");
    var selectedDir = 7

    NumSearch(selectedDir);
}

function CreateLeftPlan(roombx, hsex, door, windows, indoor, windowsline, doors) {
    roomsInfo = roombx
    d3.select('body').select('#LeftBaseSVG').selectAll('rect').remove();
    d3.select('body').select('#LeftLayoutSVG').selectAll("svg > *").remove();

    let interior_color = roomcolor("Interior wall");
    var border = 4;
    leftLayout = roombx;


    // Tiếp tục
    console.log("++++++++++++++++++++++++++++")
    console.log(roombx)


    for (let i = 0; i < roombx.length; i++) {
        var rx = roombx[i][0][0];
        var ry = roombx[i][0][1];
        var rw = roombx[i][0][2] - roombx[i][0][0];
        var rh = roombx[i][0][3] - roombx[i][0][1];


        /*var canvas3d = document.getElementById('canvas3d');
        var ctx = canvas3d.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(roombx[i][0][0], roombx[i][0][1]);
        ctx.lineTo(roombx[i][0][2], roombx[i][0][1]);
        ctx.lineTo(roombx[i][0][2], roombx[i][0][3]);
        ctx.lineTo(roombx[i][0][0], roombx[i][0][3]);
        ctx.lineTo(roombx[i][0][0], roombx[i][0][1]);
        ctx.closePath();
        ctx.stroke();*/


        var color = roomcolor(roombx[i][1][0]);
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip") //用于css设置类样式
            .attr("opacity", 0.0).attr("id", "tooltip" + roombx[i][1][0])
            .text(roombx[i][1][0]);
        d3.select("#LeftLayoutSVG").append("rect").attr("x", rx)//每个矩形的起始x坐标
            .attr("y", ry)
            .attr("width", rw)
            .attr("height", rh)//每个矩形的高度
            .attr("stroke-width", border)//加边框厚度
            .attr("stroke", interior_color)
            .attr("fill", color)//填充颜色
            .attr("id", roombx[i][1][0] + "_" + roombx[i][2])
            .on("mousedown", rect_mousedown)
            .on("mousemove", rect_mousemove)
            .on("mouseup", rect_mouseup)
            .on("click", rect_click)
            .on("dblclick", rect_dblclick)
            .append("title")//此处加入title标签
            .text(roombx[i][1][0]);//title标签的文字

    }



    // for (let i = 0; i < indoor.length; i++) {
    //     d3.select("#LeftLayoutSVG").append("rect").attr("x", indoor[i][0])//每个矩形的起始x坐标
    //         .attr("y", indoor[i][1])
    //         .attr("width", indoor[i][2])
    //         .attr("height", indoor[i][3])//每个矩形的高度
    //         .attr("fill", roomcolor("Interior door"));//填充颜色
    // }

    d3.select("#LeftLayoutSVG")
        .append("polygon")
        .attr("points", hsex)
        .attr("fill", "none")
        .attr("stroke", roomcolor("Exterior wall"))
        .attr("stroke-width", border);
    var door = door.split(",");
    var fontdoor_color = roomcolor("Front door");
    d3.select('body').select('#LeftLayoutSVG').append('line')
        .attr("x1", parseInt(door[0]))
        .attr("y1", door[1])
        .attr("x2", door[2])
        .attr("y2", door[3])
        .attr("stroke", fontdoor_color)
        .attr("stroke-width", border);


    var wincolor = d3.rgb(195, 195, 195);
    // for (let i = 0; i < windows.length; i++) {
    //
    //     d3.select("#LeftBaseSVG").append("rect").attr("x", windows[i][0])//每个矩形的起始x坐标
    //         .attr("y", windows[i][1])
    //         .attr("width", windows[i][2])
    //         .attr("height", windows[i][3])//每个矩形的高度
    //         .attr("fill", "#ffffff")
    //         .attr("stroke",wincolor)
    //          .attr("stroke-width", 1);
    // }
    //boudary clip
    //??
    // d3.select("body").select("#LeftCanvas").attr("style", "display:none");
    d3.select("#LeftLayoutSVG").append("clipPath")
        .attr("id", "clip-th")
        .append("polygon")
        .attr("points", hsex);
    /*for (let i = 0; i < windows.length; i++) {

        d3.select("#LeftLayoutSVG").append("rect").attr("x", windows[i][0])//每个矩形的起始x坐标
            .attr("y", windows[i][1])
            .attr("width", windows[i][2])
            .attr("height", windows[i][3])//每个矩形的高度
            .attr("fill", wincolor).attr("fill", "#ffffff")
            .attr("stroke", wincolor)
            .attr("stroke-width", 1);
    }
    for (let i = 0; i < windowsline.length; i++) {
        d3.select('body').select('#LeftLayoutSVG').append('line')
            .attr("x1", windowsline[i][0])
            .attr("y1", windowsline[i][1])
            .attr("x2", windowsline[i][2])
            .attr("y2", windowsline[i][3]).attr("stroke", wincolor)
            .attr("stroke-width", 1).attr("class", "windowsline");
    }*/

    for (let i = 0; i < doors.length; i++) {

        d3.select('body').select('#LeftLayoutSVG').append('line')
            .attr("x1", doors[i][1])
            .attr("y1", doors[i][2])
            .attr("x2", doors[i][1] + doors[i][3])
            .attr("y2", doors[i][2] + doors[i][4])
            .attr("stroke", "white")
            .attr("stroke-width", 5)
            .attr("id", "interior_" + i)
            .attr("class", "windowsline")
            .on("click", interiordoor_click);
    }

    if (checkTransfer == 1) {
        document.getElementById("create3dFloorplan").addEventListener("click", function () {
            var baseUrl = window.location.origin; // hoặc window.location.pathname nếu bạn muốn chỉ lấy phần đường dẫn

            // Tạo đường dẫn hoàn chỉnh bằng cách kết hợp với đường dẫn tương đối
            var fullUrl = baseUrl + "/view3dFloorplan";

            // Chuyển hướng đến trang mới
            window.open(fullUrl);
            console.log(hsex)
            console.log(roombx)
            console.log(doors)
            let canvas3d = document.getElementById('canvas3d');
            let ctx = canvas3d.getContext('2d');

            ctx.clearRect(0, 0, canvas3d.width, canvas3d.height);
            // Vẽ đoạn màu đen
            let blackPath = new Path2D();
            let points = hsex.split(' ');
            let startPoint = points[0].split(',');
            blackPath.moveTo(startPoint[0], startPoint[1]);
            ctx.lineWidth = 5; // Đặt độ dày của nét vẽ
            ctx.strokeStyle = "black"; // Đặt màu nét vẽ là đen
            ctx.imageSmoothingEnabled = false;

            for (let i = 1; i < points.length; i++) {
                let point = points[i].split(',');
                blackPath.lineTo(point[0], point[1]);
            }
            blackPath.lineTo(startPoint[0], startPoint[1]);
            //ctx.stroke(blackPath);
            let stringrooms = "";
            for (let i = 0; i < roombx.length; i++) {
                stringrooms = stringrooms + Math.round(roombx[i][0][0]) + "," + Math.round(roombx[i][0][1]) + "," + Math.round(roombx[i][0][2]) + "," + Math.round(roombx[i][0][3]) + " ";
            }
            stringrooms = stringrooms.slice(0, -1)
            //console.log("check thử" + stringrooms)
            let hahaaahihi = ""
            $.get("/index/findCommonPart/", { 'boundary': hsex.slice(0, -1), 'room': stringrooms }, function (ret) {
                console.log("ret" + ret)
                hahaaahihi = ret
                console.log(hahaaahihi)

                let points2 = hahaaahihi.split('|');
                console.log(points2.length)
                for (let j = 0; j < points2.length; j++) {
                    //let blackPath1 = new Path2D();
                    console.log("j " + j)
                    let points1 = points2[j].split(' ')
                    console.log(points1)
                    let startPoint1 = points1[0].split(',');
                    console.log(startPoint1)
                    blackPath.moveTo(parseInt(startPoint1[0]), parseInt(startPoint1[1]));
                    for (let i = 0; i < points1.length; i++) {
                        console.log("i" + i)
                        ctx.lineWidth = 5; // Đặt độ dày của nét vẽ
                        ctx.strokeStyle = "black"; // Đặt màu nét vẽ là đen
                        startPoint1 = points1[i].split(',')
                        console.log(startPoint1)
                        //ctx.imageSmoothingEnabled = false;

                        //for (let i = 1; i < points1.length; i++) {
                        //    let point1 = points1[i].split(',');
                        //    blackPath1.lineTo(parseInt(point1[0]), parseInt(point1[1]));
                        //}
                        blackPath.lineTo(parseInt(startPoint1[0]), parseInt(startPoint1[1]));
                    }
                }
                ctx.stroke(blackPath);
                //}

                // Vẽ đoạn màu trắng
                let whitePath = new Path2D();
                let whiteLineStartPoint = points[0].split(',');
                let whiteLineEndPoint = points[1].split(',');
                whitePath.moveTo(whiteLineStartPoint[0], whiteLineStartPoint[1]);
                whitePath.lineTo(whiteLineEndPoint[0], whiteLineEndPoint[1]);
                for (let i = 0; i < doors.length; i++) {
                    whitePath.moveTo(doors[i][1], doors[i][2]);
                    whitePath.lineTo(doors[i][1] + doors[i][3], doors[i][2] + doors[i][4]);
                }
                ctx.lineWidth = 6;
                ctx.strokeStyle = "white";
                ctx.stroke(whitePath);



                //let blackPath2 = new Path2D();
                //ctx.lineWidth = 3; // Đặt độ dày của nét vẽ
                //ctx.strokeStyle = "black"; // Đặt màu nét vẽ là đen
                //ctx.imageSmoothingEnabled = false;

                //for (let i = 0; i < roombx.length; i++) {
                //    blackPath2.moveTo(roombx[i][0][0], roombx[i][0][1]);
                //    blackPath2.lineTo(roombx[i][0][2], roombx[i][0][1]);
                //    blackPath2.lineTo(roombx[i][0][2], roombx[i][0][3]);
                //    blackPath2.lineTo(roombx[i][0][0], roombx[i][0][3]);
                //    blackPath2.lineTo(roombx[i][0][0], roombx[i][0][1]);
                //}
                //blackPath2.lineTo(startPoint[0], startPoint[1]);
                //ctx.stroke(blackPath2);


                let imageData = canvas3d.toDataURL('image/png');
                var formData = new FormData();
                formData.append('imageData', imageData);
                formData.append('imageName', "example.png")

                fetch("/index/save_canvas_image/", {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': '{{ csrf_token }}'
                    },
                    body: formData,

                })
                    .then(response => response.text())
                    .then(data => {
                        console.log(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });

            });
        });


    };
    d3.select('body').select('#LeftLayoutSVG').attr("transform", "scale(2)");
    d3.select("#LeftLayoutSVG").attr("clip-path", "url(#clip-th)");

}

function CreateRightImage(roomID) {
    $.getJSON("/index/LoadTrainHouse/", { 'roomID': roomID }, function (ret) {
        //Graph edge
        for (let i = 0; i < ret['hsedge'].length; i++) {
            var roomA = ret['hsedge'][i][0];
            var roomB = ret['hsedge'][i][1];

            d3.select('body').select('#RightSVG').append('line')
                .attr("x1", ret['rmpos'][roomA][2])
                .attr("y1", ret['rmpos'][roomA][3])
                .attr("x2", ret['rmpos'][roomB][2])
                .attr("y2", ret['rmpos'][roomB][3])
                .attr("stroke", "#000000")
                .attr("stroke-width", "2px")
                .attr("id", ret['rmpos'][roomA][1] + "-" + ret['rmpos'][roomB][1])
        }
        //Graph node size
        //Graph node
        for (let i = 0; i < ret['rmpos'].length; i++) {
            d3.select('body').select('#RightSVG').append('circle')
                .attr("cx", ret['rmpos'][i][2])
                .attr("cy", ret['rmpos'][i][3])
                .attr("fill", roomcolor(ret['rmpos'][i][1]))
                // .attr("r", 5)
                .attr("r", ret['rmsize'][i][0][0])

                .attr("stroke", "#000000")
                .attr("stroke-width", 2)
                .attr("id", (i + 1) + "-" + ret['rmpos'][i][1])
        }
        d3.select('body').select('#RightSVG').attr("transform", "scale(2)");

        var border = 4;
        //Layout room
        var roombx = ret["hsbox"];
        let interiorwall_color = roomcolor("Interior wall");
        for (let i = 0; i < roombx.length; i++) {

            var rx = roombx[i][0][0];
            var ry = roombx[i][0][1];
            var rw = roombx[i][0][2] - roombx[i][0][0];
            var rh = roombx[i][0][3] - roombx[i][0][1];
            var color = roomcolor(roombx[i][1][0]);

            d3.select("#RightLayoutSVG")
                .append("rect")
                .attr("x", rx)//每个矩形的起始x坐标
                .attr("y", ry)
                .attr("width", rw)
                .attr("height", rh)//每个矩形的高度
                .attr("stroke-width", 3)//加边框厚度
                .attr("stroke", interiorwall_color)
                .attr("fill", color)//填充颜色
                .attr("id", roombx[i][1][0]);
        }

        var hsex = ret["exterior"];

        //clip over boundary
        d3.select("#RightLayoutSVG").append("clipPath")
            .attr("id", "Rightclip-th")
            .append("polygon")
            .attr("points", hsex);
        d3.select("#RightLayoutSVG").attr("clip-path", "url(#Rightclip-th)");
        //Layout Boundary
        d3.select("#RightLayoutSVG")
            .append("polygon")
            .attr("points", hsex)
            .attr("fill", "none")
            .attr("stroke", roomcolor("Exterior wall"))
            .attr("stroke-width", 6);
        //door
        var door = ret['door'].split(",");

        var fontdoor_color = roomcolor("Front door");
        d3.select('body').select('#RightLayoutSVG').append('line')
            .attr("x1", door[0])
            .attr("y1", door[1])
            .attr("x2", door[2])
            .attr("y2", door[3])
            .attr("stroke", fontdoor_color)
            .attr("stroke-width", 6);
    });
    d3.select('body').select('#RightLayoutSVG').attr("transform", "scale(2)");

}

function GetEditGraph(ret) {
    var hsname = null;
    var arr, reg = new RegExp("(^| )hsname=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        hsname = arr[2];

    var newCircles = d3.select("body").select("#LeftGraphSVG").selectAll("circle");
    var GraphNode = [];
    newCircles.each(function (d, i) {
        var newnode = [];
        let idlist = this.id.split("_");
        newnode.push(idlist[1]);
        newnode.push(idlist[2]);
        if (idlist[2] == "Balcony" && selectedEdgePoint[0] >= 0) {
            newnode.push(selectedEdgePoint[0]);
            newnode.push(selectedEdgePoint[1]);
            //this.setAttribute("cx", selectedEdgePoint[0]);
            //this.setAttribute("cy", selectedEdgePoint[1]);
        } else {
            newnode.push(this.cx.animVal.value);
            newnode.push(this.cy.animVal.value);
        }
        newnode.push(this.attributes.scalesize.value);
        GraphNode.push(newnode);
        // GraphNode.push(newnode);
    });
    var newLine = d3.select("body").select("#LeftGraphSVG").selectAll("line");
    // console.log(newLine);
    var GraphEdge = [];
    newLine.each(function (d, i) {
        var newedge = [];
        let idlist = this.id.split("_");
        newedge.push(idlist[1]);
        newedge.push(idlist[2]);
        GraphEdge.push(newedge);
    });
    var NewGraph = [];
    NewGraph.push(GraphNode);
    NewGraph.push(GraphEdge);
    if (ret != 0) {
        NewGraph.push(ret);
    }
    return NewGraph
}

function GetEditLayout() {
    var hsname = null;
    var arr, reg = new RegExp("(^| )hsname=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        hsname = arr[2];

    var newRects = d3.select("body").select("#LeftLayoutSVG").selectAll("rect");
    var LayRect = [];
    newRects.each(function (d, i) {
        var newrect = [];
        let idlist = this.id.split("_");
        newrect.push(idlist[0]);
        newrect.push(idlist[1]);
        newrect.push(this.x.animVal.value);
        newrect.push(this.y.animVal.value);
        newrect.push(this.x.animVal.value + this.width.animVal.value);
        newrect.push(this.y.animVal.value + this.height.animVal.value);
        LayRect.push(newrect);
    });
    return LayRect
}

function GraphSearch() {
    document.getElementById("graphdiv").style = "display:none;cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 850px;";
    document.getElementById("layoutdiv").style = "display:none;cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 950px;";

    var hsname = null;
    var arr, reg = new RegExp("(^| )hsname=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        hsname = arr[2];
    NewGraph = GetEditGraph(0);
    var rooms = [];
    rooms.push(hsname);
    var obj = Num();
    var Numrooms = [];
    Numrooms.push(obj.roomactarr);
    Numrooms.push(obj.roomexaarr);
    Numrooms.push(obj.roomnumarr);
    $.get("/index/GraphSearch/", {
        'NewGraph': JSON.stringify(NewGraph),
        'userRoomID': hsname,
        'Numrooms': JSON.stringify(Numrooms),
    }, function (ret) {
        ListBox(ret, rooms)
    });
}

function CreateLeftGraph(rooms, roomID) {
    $.getJSON("/index/TransGraph/", { 'userInfo': rooms.toString(), 'roomID': roomID, 'selectedEdgePoint': selectedEdgePoint.toString() }, function (ret) {
        document.getElementById("Generate").onclick = function () {
            var AdjustNewGraph = [];
            AdjustNewGraph = GetEditGraph(ret['rmpos']);
            // NewGraph.push(ret['rmpos']);

            $.get("/index/AdjustGraph/", {
                'NewGraph': JSON.stringify(AdjustNewGraph),
                'userRoomID': rooms.toString().split(',')[0],
                'adptRoomID': roomID
            }, function (adjust_ret) {
                CreateLeftPlan(adjust_ret['roomret'], adjust_ret['exterior'], adjust_ret["door"], adjust_ret["windows"], adjust_ret["indoor"], adjust_ret["windowsline"], adjust_ret["doors"]);
                d3.select('body').select('#LeftGraphSVG').selectAll('circle').attr("r", 0);

                for (let i = 0; i < adjust_ret['rmpos'].length; i++) {
                    let id = null;
                    var Circlesize = null;
                    id = "TransCircle" + "_" + adjust_ret['rmpos'][i][4] + "_" + adjust_ret['rmpos'][i][1];
                    Circlesize = d3.select("body").select("#LeftGraphSVG").select("#" + id);
                    // console.log(id);
                    // console.log(adjust_ret['rmsize'][i][0]);
                    if (parseInt((adjust_ret['rmsize'][i][0])) == 0) {
                        adjust_ret['rmsize'][i][0] = 4;
                    }
                    Circlesize.attr("r", adjust_ret['rmsize'][i][0]);
                }
            });
        };



        for (let i = 0; i < ret['hsedge'].length; i++) {
            var roomA = ret['hsedge'][i][0];
            var roomB = ret['hsedge'][i][1];
            var A_B = ret['hsedge'][i][2];
            let id = "TransLine" + "_" + roomA + "_" + roomB + "_" + A_B;
            CreateLine(ret['rmpos'][roomA][2], ret['rmpos'][roomA][3],
                ret['rmpos'][roomB][2], ret['rmpos'][roomB][3], id);
        }
        for (let i = 0; i < ret['rmpos'].length; i++) {
            let id = "TransCircle" + "_" + i + "_" + ret['rmpos'][i][1];
            CreateCircle(ret['rmpos'][i][2], ret['rmpos'][i][3], id, ret['rmsize'][i][0][0]);
            d3.select("body").select("#LeftGraphSVG").select("#" + id).attr('scalesize', 1);
        }

        document.cookie = "RoomNum=" + ret['rmpos'].length;
        NewGraph = GetEditGraph(ret['rmpos']);
        $.get("/index/AdjustGraph/", {
            'NewGraph': JSON.stringify(NewGraph),
            'userRoomID': rooms.toString().split(',')[0],
            'adptRoomID': roomID
        }, function (adjust_ret) {
            // console.log("ret");
            leftLayout = adjust_ret['roomret']
            leftLayoutEdge = adjust_ret['hsedge']
            CreateLeftPlan(adjust_ret['roomret'], adjust_ret['exterior'], adjust_ret["door"], adjust_ret["windows"], adjust_ret["indoor"], adjust_ret["windowsline"], adjust_ret["doors"]);
            document.getElementById("downLoad").onclick = function () {
                var adjust_ret_json = JSON.stringify(adjust_ret);
                var formData = new FormData();
                formData.append('imageData', adjust_ret_json);
                formData.append('imageName', "example.png");

                // Lấy token CSRF từ cookie
                function getCSRFToken() {
                    var cookieValue = null;
                    if (document.cookie && document.cookie !== '') {
                        var cookies = document.cookie.split(';');
                        for (var i = 0; i < cookies.length; i++) {
                            var cookie = cookies[i].trim();
                            if (cookie.substring(0, 'csrftoken'.length + 1) === ('csrftoken' + '=')) {
                                cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                                break;
                            }
                        }
                    }
                    return cookieValue;
                }

                var csrfToken = getCSRFToken();

                // Gửi yêu cầu POST với token CSRF
                fetch("/index/save_floorplan_image/", {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken 
                    },
                    body: formData
                })
                    .then(response => response.text())
                    .then(data => {
                        console.log(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });

                var arr, reg = new RegExp("(^| )hsname=([^;]*)(;|$)");
                if (arr = document.cookie.match(reg))
                    hsname = arr[2];
                if (document.getElementById("graph").checked == true) {
                    var link = document.createElement('a');
                    link.href = "../static/" + hsname.split(".")[0] + ".mat";
                    var event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    link.dispatchEvent(event);
                } else {
                    var NewLay = [];
                    NewLay = GetEditLayout();
                    var newGraph = [];
                    newGraph = GetEditGraph(ret['rmpos']);
                    $.get("/index/Save_Editbox/", {
                        'NewLay': JSON.stringify(NewLay),
                        'NewGraph': JSON.stringify(newGraph),
                        'userRoomID': rooms.toString().split(',')[0],
                        'adptRoomID': roomID
                    }, function (flag) {

                        var link = document.createElement('a');
                        link.href = "../static/" + hsname.split(".")[0] + ".png.mat";
                        var event = document.createEvent('MouseEvents');
                        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        link.dispatchEvent(event);
                    });
                }

            }

        });

    });
    d3.select('body').select('#LeftGraphSVG').attr("transform", "scale(2)");

}

function showGraph(oCtl) {
    // $(oCtl).is(':checked') ? d3.select("body").select("#LeftGraphSVG").attr("opacity", "1.0") : d3.select("body").select("#LeftGraphSVG").attr("opacity", "0.0");
    // $(oCtl).is(':checked') ? d3.select("body").select("#LeftGraphSVG").attr("style", "position: relative;z-index:999!important;") : d3.select("body").select("#LeftGraphSVG").attr("style", "position: relative;z-index:888 !important;");
    // $(oCtl).is(':checked') ? d3.select("body").select("#LeftLayoutSVG").attr("style", "position: relative;margin-left: -259.5px;z-index:888!important;") : d3.select("body").select("#LeftLayoutSVG").attr("style", "position: relative;margin-left: -259.5px;z-index:999 !important;");
    if ($(oCtl).is(':checked')) {
        if (document.getElementById("layout").checked == true) {
            d3.select("body").select("#LeftGraphSVG").attr("display", "flex").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:999!important;");
            d3.select("body").select("#LeftLayoutSVG").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:888!important;").attr("opacity", "1.0");
        } else {
            d3.select("body").select("#LeftGraphSVG").attr("display", "flex").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:999!important;");
            d3.select("body").select("#LeftLayoutSVG").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:888!important;").attr("opacity", "0.0");
        }
        document.getElementById("graphimg").style = "display:inline-flex;";
        document.getElementById("graphdiv").style = "cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 850px;"
        document.getElementById("Editing").style = "display:none;";

    } else {
        document.getElementById("graphimg").style = "display:none;";
        //document.getElementById("Editing").style = "display:flex;margin-left: 140px;     margin-top: inherit;";

        // 方法一

        if (document.getElementById("layout").checked == true) {
            d3.select("body").select("#LeftGraphSVG").attr("display", "none").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:888!important;");
            d3.select("body").select("#LeftLayoutSVG").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:999!important;").attr("opacity", "1.0");
        } else {
            d3.select("body").select("#LeftGraphSVG").attr("display", "none").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:999!important;");
            d3.select("body").select("#LeftLayoutSVG").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:888!important;").attr("opacity", "0.0");
        }
        document.getElementById("graphdiv").style = "cursor: default;color: #000;width: 90px;        border: 2px solid #bfbfbf;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 850px;"

    }
}

function showRoom(oCtl) {
    // $(oCtl).is(':checked') ? d3.select("body").select("#LeftLayoutSVG").attr("opacity", "1.0") : d3.select("body").select("#LeftLayoutSVG").attr("opacity", "0.0");
    // $(oCtl).is(':checked') ? d3.select("body").select("#LeftLayoutSVG").attr("style", "position: relative;margin-left: -259.5px;z-index:888!important;") : d3.select("body").select("#LeftLayoutSVG").attr("style", "position: relative;margin-left: -259.5px;z-index:888!important;");
    // $(oCtl).is(':checked') ? d3.select("body").select("#LeftGraphSVG").attr("style", "position: relative;z-index:999!important;") : d3.select("body").select("#LeftGraphSVG").attr("style", "position: relative;z-index:999!important;");
    if ($(oCtl).is(':checked')) {
        if (document.getElementById("graph").checked == true) {
            d3.select("body").select("#LeftGraphSVG").attr("display", "flex").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:999!important;");
            d3.select("body").select("#LeftLayoutSVG").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:888!important;").attr("opacity", "1.0");
        } else {
            d3.select("body").select("#LeftGraphSVG").attr("display", "flex").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:888!important;");
            d3.select("body").select("#LeftLayoutSVG").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:999!important;").attr("opacity", "1.0");
        }
        document.getElementById("layoutimg").style = "display:inline-flex;";
        document.getElementById("layoutdiv").style = "cursor: default;color: #000;width: 90px;border: 2px solid #0072ca;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 950px;"

    } else {
        if (document.getElementById("graph").checked == true) {
            d3.select("body").select("#LeftGraphSVG").attr("display", "flex").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:999!important;");
            d3.select("body").select("#LeftLayoutSVG").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:888!important;").attr("opacity", "0.0");
        } else {
            d3.select("body").select("#LeftGraphSVG").attr("display", "none").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:999!important;");
            d3.select("body").select("#LeftLayoutSVG").attr("style", "margin-left: 128px;margin-top: 128px;position: absolute;z-index:888!important;").attr("opacity", "0.0");
        }
        document.getElementById("layoutimg").style = "display:none;";
        document.getElementById("layoutdiv").style = "cursor: default;color: #000;width: 90px;border: 2px solid #bfbfbf;border-radius: 30px;text-align: center;vertical-align: middle;line-height: 26px;height: 30px;position: absolute;margin-left: 950px;"

    }
}

function circle_mousedown() {

    if (createNewLine) {

        let id = "TransLine" + "_" + startPoint[0].split("_")[1] + "_" + this.id.split("_")[1] + "_0";

        if (hasLine(id)) {
            return;
        }

        //被选中的点现在也不显示是吧？这里变得颜色都一样
        var points = d3.select("body").select("#LeftGraphSVG").selectAll("circle").attr("stroke", "#000000").attr("stroke-width", 2);
        var selectPoint = d3.select("body").select("#LeftGraphSVG").select("#" + this.id).attr("stroke", "#000000").attr("stroke-width", 2);
        scalesize = d3.select("body").select("#LeftGraphSVG").select("#" + this.id).attr("scalesize");

        CreateLine(startPoint[1], startPoint[2], this.cx.animVal.value, this.cy.animVal.value, id);

        d3.select(this).remove();
        d3.select("#" + startPoint[0]).remove();
        adjust_graph = true;
        CreateCircle(startPoint[1], startPoint[2], startPoint[0], startPoint[3]);
        var start = d3.select("body").select("#LeftGraphSVG").select("#" + startPoint[0]).attr("scalesize", startPoint[4]);
        CreateCircle(this.cx.animVal.value, this.cy.animVal.value, this.id, selectPoint.attr('r'));
        var end = d3.select("body").select("#LeftGraphSVG").select("#" + this.id).attr("scalesize", scalesize);
        createNewLine = false;
        return;
    }

    focus_circle = true;
    var points = d3.select("body").select("#LeftGraphSVG").selectAll("circle").attr("stroke", "#000000").attr("stroke-width", 2);
    var selectPoint = d3.select("body").select("#LeftGraphSVG").select("#" + this.id).attr("stroke", "rgba(0,0,0,0.56)").attr("stroke-width", 2);
    let isDelete = document.querySelector('#isDelete');
    //禁用系统右键菜单
    document.oncontextmenu = function (eve) {
        return false;
    };

    if (d3.event.button == 2) {
        // var deletealert = confirm("是否删除？");
        // if (deletealert == true) {
        //     selectPoint.remove();
        //     focus_circle = false;
        //     adjust_graph = true;
        //     var pointInd = this.id.split("_")[1];
        //
        //     var lines = d3.select("body").select("#LeftGraphSVG").selectAll(".TransLine");
        //     lines.each(function (d, i) {
        //         var startPoint = this.id.split("_")[1];
        //         var endPoint = this.id.split("_")[2];
        //
        //         if (startPoint == pointInd || endPoint == pointInd) {
        //             adjust_graph = true;
        //             d3.select(this).remove();
        //         }
        //     })
        // }
        var leftsvg = document.getElementById('LeftGraphSVG');

        //自定义右键菜单唤醒和关闭
        isDelete.style.left = (d3.event.clientX - 256) + 'px';
        isDelete.style.top = (d3.event.clientY) + 'px';
        isDelete.style.display = 'block';
        var pointInd = this.id.split("_")[1];

        //事件委托写法
        isDelete.onmousedown = function (eve) {

            if (eve.target.innerText == 'Delete') {
                setTimeout(function () {
                    selectPoint.remove();
                    focus_circle = false;
                    adjust_graph = true;

                    var lines = d3.select("body").select("#LeftGraphSVG").selectAll(".TransLine");
                    lines.each(function (d, i) {
                        var startPoint = this.id.split("_")[1];
                        var endPoint = this.id.split("_")[2];

                        if (startPoint == pointInd || endPoint == pointInd) {
                            adjust_graph = true;
                            d3.select(this).remove();
                        }
                    })
                }, 10);
            }
            if (eve.target.innerText == 'Scale*0.5') {
                SelectRadius = selectPoint.attr('r');
                ScaleRadius = SelectRadius * 0.5;
                selectPoint.attr('r', ScaleRadius);
                selectPoint.attr('scalesize', 0.5);
            }
            if (eve.target.innerText == 'Scale*0.25') {
                SelectRadius = selectPoint.attr('r');
                ScaleRadius = SelectRadius * 0.25;
                selectPoint.attr('r', ScaleRadius);
                selectPoint.attr('scalesize', 0.25);
            }
            if (eve.target.innerText == 'Scale*5') {
                SelectRadius = selectPoint.attr('r');
                ScaleRadius = SelectRadius * 5;
                selectPoint.attr('r', ScaleRadius);
                selectPoint.attr('scalesize', 5);
            }
            if (eve.target.innerText == 'Scale*2') {
                SelectRadius = selectPoint.attr('r');
                ScaleRadius = SelectRadius * 2;
                selectPoint.attr('r', ScaleRadius);
                selectPoint.attr('scalesize', 2);
            }

            isDelete.style.display = 'none';
        }
        $(document).click(function (e) {
            var pop = $('#isDelete')[0];
            if (e.target != pop && !$.contains(pop, e.target)) pop.style.display = 'none'
        })
    }

}

function hasLine(id) {
    var lines = d3.select(".TransLine");

    lines.each(function (d, i) {
        if (this.id == id)
            return true;
    });

    return false;
}

function circle_mousemove() {

    console.log("Move!");

    if (focus_circle) {
        var leftsvg = document.getElementById('LeftGraphSVG');
        let newX = d3.event.x - leftsvg.getBoundingClientRect().left;
        let newY = d3.event.y - leftsvg.getBoundingClientRect().top;

        // console.log(newX + " " + newY)

        var transLines = d3.select("body").select("#LeftGraphSVG").selectAll(".TransLine");

        var pointID = (this.id).split("_")[1];

        transLines.each(function (d, i) {
            var tmp_array = (this.id).split("_");

            if (tmp_array[1] == pointID) {
                d3.select(this).attr("x1", newX / 2).attr("y1", newY / 2);
            }
            if (tmp_array[2] == pointID) {
                d3.select(this).attr("x2", newX / 2).attr("y2", newY / 2);
            }
        })

        var selectPoint = d3.select("body").select("#LeftGraphSVG").select("#" + this.id)
            .attr("cx", newX / 2).attr("cy", newY / 2);
        adjust_graph = true;
        // console.log(adjust_graph, "adjust")
    }
}

function circle_mouseup() {
    focus_circle = false;
}

function circle_dblclick() {
    createNewLine = true;
    var selectPoint = d3.select("body").select("#LeftGraphSVG").select("#" + this.id).attr("stroke", "#d84447").attr("stroke-width", 3);

    startPoint[0] = this.id;
    startPoint[1] = this.cx.animVal.value;
    startPoint[2] = this.cy.animVal.value;
    startPoint[3] = this.r.animVal.value;
    startPoint[4] = this.attributes.scalesize.value;
}

function line_mousedown() {
    focus_line = true;
    var lines = d3.select("body").select("#LeftGraphSVG").selectAll("line").attr("stroke", "#000000")
    var selectLine = d3.select("body").select("#LeftGraphSVG").select("#" + this.id).attr("stroke", "#d83230");

    if (d3.event.button == 2) {

        //var startPoint = this.id.split("_")[1];
        //var endPoint = this.id.split("_")[2];

        //console.log(startPoint,endPoint);

        //let isStartSingle = true;
        //let isEndSingle = true;

        selectLine.remove();

        //var curlines = d3.select("body").select("#LeftGraphSVG").selectAll("line");

        /*curlines.each(function(d,i){
            var tmp_start = this.id.split("_")[1];
            var tmp_end = this.id.split("_")[2];

            if(startPoint == tmp_start || startPoint == tmp_end) isStartSingle = false;
            if(endPoint == tmp_start || endPoint == tmp_end) isEndSingle = false;
        })

        console.log(isStartSingle,isEndSingle);

        var circles = d3.select("body").select("#LeftGraphSVG").selectAll(".TransCircle");

        circles.each(function(d,i){
            var tmp_ind = this.id.split("_")[1];

            if(isStartSingle && tmp_ind==startPoint) d3.select(this).remove();
            if(isEndSingle && tmp_ind==endPoint) d3.select(this).remove();
        })*/

        focus_line = false;
    }
}

function line_mouseup() {
    focus_line = false;
}

function rect_mousedown() {
    console.log("rect_mousedown");

    if (focus_rect != "") {
        var leftlaysvg = document.getElementById('LeftLayoutSVG');

        let mousex = (d3.event.x - leftlaysvg.getBoundingClientRect().left) / 2;
        let mousey = (d3.event.y - leftlaysvg.getBoundingClientRect().top) / 2;
        var oldx = startRectvalue[0];
        var oldy = startRectvalue[1];
        var oldw = startRectvalue[2];
        var oldh = startRectvalue[3];

        Type = rectzoomType(mousex, mousey, oldx, oldy, oldw, oldh);
        console.log(Type);

        rect_type = true;
    }
}

function rectzoomType(mousex, mousey, oldx, oldy, oldw, oldh) {
    if (oldy < mousey && mousey < oldy + oldh) {
        if (mousex < oldx + oldw + 16) {
            // $('#LeftLayoutSVG').css('cursor', 'e-resize');
            if (oldx + oldw - 16 < mousex) {
                d3.select("body").select("#LeftLayoutSVG").attr('cursor', 'e-resize');
                var type = "right";
                return type;
            }
        }
        if (mousex < oldx + 12) {
            if (oldx - 16 < mousex) {
                d3.select("body").select("#LeftLayoutSVG").attr('cursor', 'w-resize');
                var type = "left";
                return type;

            }

        }
    }
    if (oldx < mousex && oldx < oldx + oldw) {
        if (mousey < oldy + 16) {
            if (oldy - 16 < mousey) {
                d3.select("body").select("#LeftLayoutSVG").attr('cursor', 'n-resize');
                var type = "top";
                return type;
            }


        }
        if (mousey < oldy + oldh + 16) {
            if (oldy + oldh - 16 < mousey) {
                d3.select("body").select("#LeftLayoutSVG").attr('cursor', 's-resize');
                var type = "down";
                return type;

            }

        }
    }
    if (type == undefined) {
        d3.select("body").select("#LeftLayoutSVG").attr('cursor', 'default');

    }
}

function rect_mousemove() {

    var leftlaysvg = document.getElementById('LeftLayoutSVG');
    let mousex = (d3.event.x - leftlaysvg.getBoundingClientRect().left) / 2;
    let mousey = (d3.event.y - leftlaysvg.getBoundingClientRect().top) / 2;
    console.log("rect_mousemove", mousex, mousey);
    console.log(focus_rect);
    if (focus_rect == "dblclick") {
        // var oldx = this.x.animVal.value;
        // var oldy = this.y.animVal.value;
        //
        // var oldw = this.width.animVal.value;
        // var oldh = this.height.animVal.value;
        var oldx = startRectvalue[0];
        var oldy = startRectvalue[1];
        var oldw = startRectvalue[2];
        var oldh = startRectvalue[3];
        rectzoomType(mousex, mousey, oldx, oldy, oldw, oldh);
        // console.log(type);
        if (rect_type) {
            let item = null;
            var obj = document.getElementsByName("edit");
            for (let i = 0; i < obj.length; i++) { //遍历Radio
                if (obj[i].checked) {
                    item = obj[i].value;
                }
            }

            if (item == "local") {
                switch (Type) {
                    case "right":
                        selectRect.attr("width", mousex - oldx);
                        break;
                    case "left":
                        // selectRect.attr("x", mousex).attr("width", mousex - oldx + oldw);
                        selectRect.attr("x", mousex);
                        selectRect.attr("width", oldx - mousex + oldw);
                        break;
                    case "top":
                        selectRect.attr("y", mousey).attr("height", oldy - mousey + oldh);
                        break;
                    case "down":
                        selectRect.attr("height", mousey - oldy);
                        break;

                }

            }
            if (item == "global") {
                switch (Type) {
                    case "right":
                        for (i = 0; i < RelRectvalue[0].length; i++) {
                            var RelRect = d3.select("body").select("#LeftLayoutSVG").select("#" + RelRectvalue[0][i][4]);
                            RelRect.attr("width", mousex - RelRectvalue[0][i][0]);
                        }
                        break;
                    case "left":
                        for (i = 0; i < RelRectvalue[1].length; i++) {
                            var RelRect = d3.select("body").select("#LeftLayoutSVG").select("#" + RelRectvalue[1][i][4]);
                            RelRect.attr("x", mousex);
                            RelRect.attr("width", Number(RelRectvalue[1][i][0]) - mousex + Number(RelRectvalue[1][i][2]));
                        }
                        break;

                    case "down":
                        for (i = 0; i < RelRectvalue[3].length; i++) {
                            var RelRect = d3.select("body").select("#LeftLayoutSVG").select("#" + RelRectvalue[3][i][4]);
                            RelRect.attr("height", mousey - RelRectvalue[3][i][1]);
                        }
                        break;

                    case "top":

                        for (i = 0; i < RelRectvalue[2].length; i++) {
                            var RelRect = d3.select("body").select("#LeftLayoutSVG").select("#" + RelRectvalue[2][i][4]);
                            RelRect.attr("y", mousey).attr("height", Number(RelRectvalue[2][i][1]) - mousey + Number(RelRectvalue[2][i][3]));
                        }
                        break;
                }

            }

        }
    }
}


function rect_mouseup() {
    console.log("rect_mouseup");
    focus_rect = "";
    rect_type = false;
    let interior_color = roomcolor("Interior wall");

    var rects = d3.select("body").select("#LeftLayoutSVG").selectAll("rect").attr("stroke", interior_color).attr("stroke-width", 4);
    d3.select("body").select("#LeftLayoutSVG").attr('cursor', 'default');

}

function rect_dblclick() {
    console.log("rect_dblclick");
    let item = null;
    var obj = document.getElementsByName("edit");
    for (let i = 0; i < obj.length; i++) { //遍历Radio
        if (obj[i].checked) {
            item = obj[i].value;
        }
    }
    let interior_color = roomcolor("Interior wall");
    var rects = d3.select("body").select("#LeftLayoutSVG").selectAll("rect").attr("stroke", interior_color).attr("stroke-width", 4);
    selectRect = d3.select("body").select("#LeftLayoutSVG").select("#" + this.id).attr("stroke", "#d84447").attr("stroke-width", 4);
    focus_rect = "dblclick";


    startRectvalue[0] = this.x.animVal.value;
    startRectvalue[1] = this.y.animVal.value;
    startRectvalue[2] = this.width.animVal.value;
    startRectvalue[3] = this.height.animVal.value;
    if (item == "global") {
        $.get("/index/RelBox/", {
            'selectRect': this.id

        }, function (rdirgroup) {

            for (k = 0; k < rdirgroup.length; k++) {
                var RelRectvalue2 = [];
                for (i = 0; i < rdirgroup[k].length; i++) {
                    var RelRectvalue1 = [];

                    var RelRect = d3.select("body").select("#LeftLayoutSVG").select("#" + rdirgroup[k][i]);
                    RelRectvalue1[0] = RelRect.attr("x");
                    RelRectvalue1[1] = RelRect.attr("y");
                    RelRectvalue1[2] = RelRect.attr("width");
                    RelRectvalue1[3] = RelRect.attr("height");
                    RelRectvalue1[4] = rdirgroup[k][i];
                    RelRectvalue2[i] = RelRectvalue1
                }
                RelRectvalue[k] = RelRectvalue2;
            }

        });
    }
}

function rect_click() {
    let idd = this.id
    count = 0;
    if (addDoor == true) {
        if (doorsInfo.length >= 1) fnDoorInfor.push(doorsInfo[doorsInfo.length - 1])
        focus_rect = "click";
        let item = null;
        var obj = document.getElementsByName("edit");
        for (let i = 0; i < obj.length; i++) { //遍历Radio
            if (obj[i].checked) {
                item = obj[i].value;
            }
        }
        let interior_color = roomcolor("Interior wall");
        var rects = d3.select("body").select("#LeftLayoutSVG").selectAll("rect").attr("stroke", interior_color).attr("stroke-width", 1);
        selectRect = d3.select("body").select("#LeftLayoutSVG").select("#" + this.id).attr("stroke", "#44d85d").attr("stroke-width", 4);
        //focus_rect = "dblclick";
        if (addDoor) {
            ohohoh(idd)
            let inDoorColor = roomcolor("inDoor");
            var border = 2
            d3.select('body').select('#LeftLayoutSVG').append('line')
                .attr("x1", doorsInfo[doorsInfo.length - 1][2])
                .attr("y1", doorsInfo[doorsInfo.length - 1][3])
                .attr("x2", doorsInfo[doorsInfo.length - 1][2])
                .attr("y2", doorsInfo[doorsInfo.length - 1][3] + 5)
                .attr("stroke", inDoorColor)
                .attr("stroke-width", border);
            d3.select('body').select('#LeftLayoutSVG').append('line')
                .attr("x1", doorsInfo[doorsInfo.length - 1][2])
                .attr("y1", doorsInfo[doorsInfo.length - 1][3] + 5)
                .attr("x2", doorsInfo[doorsInfo.length - 1][2])
                .attr("y2", doorsInfo[doorsInfo.length - 1][3])
                .attr("stroke", inDoorColor)
                .attr("stroke-width", border);
        }
    }
}
function ohohoh(idd) {
    if (addDoor == true) {
        $('#LeftLayoutSVG').on('click', function (e) {
            //count+=1;
            let inDoorColor = roomcolor("inDoor");
            var border = 2
            var leftsvg = document.getElementById('LeftGraphSVG');
            let selectX = e.clientX - leftsvg.getBoundingClientRect().left;
            let selectY = e.clientY - leftsvg.getBoundingClientRect().top;
            selectX = Math.ceil(selectX / 2)
            selectY = Math.ceil(selectY / 2)

            var twoRooms = findTwoRoomOfDoor(idd, selectX, selectY)
            if (addDoor == true) {
                d3.select('body').select('#LeftLayoutSVG').selectAll('line').remove();
                for (let i = 0; i < fnDoorInfor.length; i++) {
                    d3.select('body').select('#LeftLayoutSVG').append('line')
                        .attr("x1", fnDoorInfor[i][2])
                        .attr("y1", fnDoorInfor[i][3])
                        .attr("x2", fnDoorInfor[i][2])
                        .attr("y2", fnDoorInfor[i][3] + 5)
                        .attr("stroke", inDoorColor)
                        .attr("stroke-width", border);
                    d3.select('body').select('#LeftLayoutSVG').append('line')
                        .attr("x1", fnDoorInfor[i][2])
                        .attr("y1", fnDoorInfor[i][3])
                        .attr("x2", fnDoorInfor[i][2] + 5)
                        .attr("y2", fnDoorInfor[i][3])
                        .attr("stroke", inDoorColor)
                        .attr("stroke-width", border);
                }

            }
            addDoor = false
        })
    }
    if (addDoor == false && numDoor >= 2 && count == 1) {
        let arr1 = doorsInfo.slice(0, doorsInfo.length - numDoor - lengthL_2)
        doorsInfo = arr1.concat(doorsInfo[doorsInfo.length - 1])
    }

}
function interiordoor_click() {

}
function addDimention() {
    let iC = houseCoords.length - 1;
    const inputContainer = document.getElementById('inputContainer');
    document.getElementById('doneButton').style.display = "inline";
    document.getElementById('unitOptions').style.display = "flex";

    document.getElementById('ratioOption').addEventListener('click', function () {
        // Tạo ô input mới
        //Sửa đến đây
        for (let i = 0; i < houseCoords.length; i++) {
        }
        for (let i = 0; i < houseCoordsCheck.length; i++) {
            let cn = 0;
            const input = document.createElement('input');
            input.type = 'text';
            input.id = 'input_' + iC;
            input.placeholder = 'Nhập tỉ lệ';
            input.style.width = '50px'
            input.addEventListener('focus', function () {
                if (cn == 0) alert('Bạn đã chọn ô input có id: ' + this.id);
                cn++;
            });
            input.addEventListener('input', function () {
                const value = this.value.trim();
                if (isNaN(value)) {
                    alert('Vui lòng nhập vào là số.');
                    this.value = '';
                }
            });

            // Thêm ô input vào container
            inputContainer.appendChild(input);

            // Tăng biến đếm để tạo id duy nhất cho mỗi ô input
            //inputCount++;
        }
    });
    document.getElementById('sizeOption').addEventListener('click', function () {
        // Tạo ô input mới
        const inputdoorm = document.createElement('input');
        inputdoorm.type = 'text';
        inputdoorm.id = 'input_m_' + 'door';
        inputdoorm.placeholder = 'met';
        inputdoorm.style.width = '50px'
        inputdoorm.addEventListener('input', function () {
            const valuedoor = this.value.trim();
            if (isNaN(valuedoor)) {
                alert('Vui lòng nhập vào là số.');
                this.valuedoor = '';
            }
        });

        //ô centimet
        let cncm = 0;
        const inputdoorcm = document.createElement('input');
        inputdoorcm.type = 'text';
        inputdoorcm.id = 'input_cm_' + 'door';
        inputdoorcm.placeholder = 'centimet';
        inputdoorcm.style.width = '50px'
        inputdoorcm.addEventListener('focus', function () {
            //if (cncm == 0) alert('Bạn đã chọn ô input có id: ' + this.id);
            //cncm++;
        });
        inputdoorcm.addEventListener('input', function () {
            const value = this.value.trim();
            if (isNaN(value)) {
                //alert('Vui lòng nhập vào là số.');
                //this.value = '';
            }
        });


        // Thêm ô input vào container
        // Tạo thẻ div với thuộc tính display: flex;
        const flexdoorDiv = document.createElement('div');
        flexdoorDiv.style.display = 'flex';

        // Thêm ô input vào thẻ div
        const mdoorSizeText = document.createElement('div');
        mdoorSizeText.textContent = 'Door length: ';
        mdoorSizeText.style.paddingLeft = '5px';
        mdoorSizeText.style.paddingRight = '5px';
        flexdoorDiv.appendChild(mdoorSizeText)
        //flexdoorDiv.appendChild(mdoorSizeText); // Thêm mText vào thẻ div

        flexdoorDiv.appendChild(inputdoorm);
        const mdoorText = document.createElement('div');
        mdoorText.textContent = 'm';
        mdoorText.style.paddingLeft = '5px';
        mdoorText.style.paddingRight = '5px';
        flexdoorDiv.appendChild(mdoorText); // Thêm mText vào thẻ div

        flexdoorDiv.appendChild(inputdoorcm);
        const cmdoorText = document.createElement('div');
        cmdoorText.textContent = 'cm';
        cmdoorText.style.paddingLeft = '5px';
        cmdoorText.style.paddingRight = '5px';
        flexdoorDiv.appendChild(cmdoorText); // Thêm cmText vào thẻ div

        // Thêm thẻ div vào container
        inputContainer.appendChild(flexdoorDiv);


        //THêm các ô input các kích thước cửa 

        for (let i = 0; i < houseCoords.length; i++) {
            //ô met
            let ic = i % houseCoords.length
            const inputm = document.createElement('input');
            inputm.type = 'text';
            inputm.id = 'input_m_' + ic;
            inputm.placeholder = 'met';
            inputm.style.width = '50px';
            inputm.addEventListener('focus', function () {
                //if (cn == 0) alert('Bạn đã chọn ô input có id: ' + this.id);
                //cn++;
                var border = 4;
                var redNotice = roomcolor("redNotice")
                if (parseInt(this.id.split("_")[2]) != houseCoords.length) {
                    d3.select('body').select('#LeftBaseSVGDraw').selectAll('line.prominent_edge').remove();
                    d3.select('body').select('#LeftBaseSVGDraw').append('line')
                        .attr("x1", houseCoordsCheck[parseInt(this.id.split("_")[2])].x)
                        .attr("y1", houseCoordsCheck[parseInt(this.id.split("_")[2])].y)
                        .attr("x2", houseCoordsCheck[(parseInt(this.id.split("_")[2]) + 1) % houseCoords.length].x)
                        .attr("y2", houseCoordsCheck[(parseInt(this.id.split("_")[2]) + 1) % houseCoords.length].y)
                        .attr("stroke", "red")
                        .attr("stroke-width", border)
                        .classed('prominent_edge', true);
                }
            });
            inputm.addEventListener('input', function () {
                const value = this.value.trim();
                if (isNaN(value)) {
                    alert('Vui lòng nhập vào là số.');
                    this.value = '';
                }
            });
            //ô centimet
            let cncm = 0;
            const inputcm = document.createElement('input');
            inputcm.type = 'text';
            inputcm.id = 'input_cm_' + ic;
            inputcm.placeholder = 'centimet';
            inputcm.style.width = '50px'
            inputcm.addEventListener('focus', function () {
                //if (cncm == 0) alert('Bạn đã chọn ô input có id: ' + this.id);
                //cncm++;
            });
            inputcm.addEventListener('input_cm_', function () {
                const value = this.value.trim();
                if (isNaN(value)) {
                    //alert('Vui lòng nhập vào là số.');
                    //this.value = '';
                }
            });
            const mEdgeSizeText = document.createElement('div');
            let t = '';
            if (i == 0) {
                t = '1st';
            } else if (i == 1) {
                t = '2nd';
            } else if (i == 2) {
                t = '3rd';
            } else {
                t = i + 'th';
            }
            mEdgeSizeText.textContent = t + ' wall: ';
            mEdgeSizeText.style.paddingLeft = '5px';
            mEdgeSizeText.style.paddingRight = '5px';
            // Thêm ô input vào container
            // Tạo thẻ div với thuộc tính display: flex;
            const flexDiv = document.createElement('div');
            flexDiv.style.display = 'flex';

            // Thêm ô input vào thẻ div
            flexDiv.appendChild(mEdgeSizeText)
            flexDiv.appendChild(inputm);

            const mText = document.createElement('div');
            mText.textContent = 'm';
            mText.style.paddingLeft = '5px';
            mText.style.paddingRight = '5px';
            flexDiv.appendChild(mText); // Thêm mText vào thẻ div

            flexDiv.appendChild(inputcm);
            const cmText = document.createElement('div');
            cmText.textContent = 'cm';
            cmText.style.paddingLeft = '5px';
            cmText.style.paddingRight = '5px';
            flexDiv.appendChild(cmText); // Thêm cmText vào thẻ div

            // Thêm thẻ div vào container
            inputContainer.appendChild(flexDiv);
        }
    });
    // Hiển thị nút "done"
    document.getElementById('doneButton').addEventListener('click', updateValues);
}

function updateValues() {
    let inputCount = houseCoords.length - 1;
    const values = [];
    let isValid = true;
    hc.push({ x: houseCoordsCheck[0].x, y: houseCoordsCheck[0].y });
    //hc.unshift({ x: houseCoords[(inputCount - 1 + houseCoords.length) %houseCoords.length].x, y: houseCoords[(inputCount - 1 + houseCoords.length) %houseCoords.length].y })

    // Lặp qua tất cả các ô input và kiểm tra giá trị
    for (let i = 0; i < houseCoordsCheck.length; i++) {
        const inputm = document.getElementById('input_m_' + i);
        const valuem = inputm.value.trim();
        const inputcm = document.getElementById('input_cm_' + i);
        const valuecm = inputcm.value.trim();
        // Kiểm tra xem ô input có giá trị hay không
        if (valuem === '' || valuecm === '') {
            isValid = false;
            alert('Vui lòng nhập đầy đủ giá trị cho các ô input.');
            break;
        }
        // Thêm giá trị vào mảng values
        values.push(parseInt(valuem) * 100 + parseInt(valuecm) * 1);
    }
    if (isValid) {
        const inputdoorm = document.getElementById('input_m_door');
        const inputdoorcm = document.getElementById('input_cm_door');
        const valuem = inputdoorm.value.trim();
        const valuecm = inputdoorcm.value.trim();
        doorSize = parseInt(valuem) * 100 + parseInt(valuecm) * 1
    }

    let ratio = 0;
    if (houseCoordsCheck[0].x == houseCoordsCheck[houseCoordsCheck.length - 1].x) {
        ratio = Math.abs(houseCoordsCheck[0].y - houseCoordsCheck[houseCoordsCheck.length - 1].y) / values[houseCoordsCheck.length - 1] // tỉ lệ độ dài vẽ với kích thước
    } else {
        ratio = Math.abs(houseCoordsCheck[0].x - houseCoordsCheck[houseCoordsCheck.length - 1].x) / values[houseCoordsCheck.length - 1]
    }
    doorSize = doorSize * ratio;
    for (let i = 0; i < houseCoordsCheck.length - 3; i++) {
        if (houseCoordsCheck[i].x == houseCoordsCheck[i + 1].x) {
            if (houseCoordsCheck[i].y > houseCoordsCheck[i + 1].y) {
                hc.push({ x: hc[i].x, y: hc[i].y - values[i] * ratio })
            } else {
                hc.push({ x: hc[i].x, y: hc[i].y + values[i] * ratio })
            }
        } else {
            if (houseCoordsCheck[i].x > houseCoordsCheck[i + 1].x) {
                hc.push({ x: hc[i].x - values[i] * ratio - doorSize, y: hc[i].y })
            } else {
                hc.push({ x: hc[i].x + values[i] * ratio - doorSize, y: hc[i].y })
            }
        }
    }

    if (houseCoordsCheck[0].y == houseCoordsCheck[houseCoordsCheck.length - 1].y) {
        hc.push({ x: houseCoordsCheck[houseCoordsCheck.length - 1].x, y: hc[houseCoordsCheck.length - 3].y })
    } else {
        hc.push({ x: hc[houseCoordsCheck.length - 3].x, y: houseCoordsCheck[houseCoordsCheck.length - 1].y })
    }

    hc.push({ x: houseCoordsCheck[houseCoordsCheck.length - 1].x, y: houseCoordsCheck[houseCoordsCheck.length - 1].y })

    //cập nhật lại hc theo thứ tụ của houseCoords
    let soluong = houseCoordsCheck.length - 2 - doorIdx;
    houseCoords = [].concat(hc.slice(soluong + 1, hc.length))
    houseCoords = houseCoords.concat(hc.slice(1, soluong + 1))
    houseCoords = houseCoords.concat(hc[0])
    drawHouse()
}