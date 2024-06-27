from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils.datastructures import MultiValueDictKeyError
import json
import model.test as mltest
import model.utils as mdul
from model.floorplan import *
import retrieval.retrieval as rt
import time
import pickle
import scipy.io as sio
import numpy as np
from model.decorate import *
import math
import pandas as pd
import matlab.engine

import base64
import io
import sys
import os
from PIL import Image
import sys
from shapely.geometry import Polygon
from shapely.geometry import MultiPolygon


import matplotlib.pyplot as plt
import matplotlib.patches as patches

information = {}
#import cairosvg
 
# adding Folder_2/subfolder to the system path
sys.path.insert(0, 'D:/TranTrang/PythonCode/G2/Graph2plan-master/PostProcess')
 
# importing the hello
from app import App
from g2p.add_archs import add_door_window
from g2p.matlab_to_python import align_fp as af

global test_data, test_data_topk, testNameList, trainNameList
global train_data, trainTF, train_data_eNum, train_data_rNum
global engview, model
global tf_train, centroids, clusters


def home(request):
    return render(request, "home.html", )
def view3dFloorplan(request):
    return render(request, "check.html")


def Init(request):
    start = time.time()
    getTestData()
    getTrainData()
    loadMatlabEng()
    loadModel()
    loadRetrieval()
    end = time.time()
    print('Init(model+test+train+engine+retrieval) time: %s Seconds' % (end - start))

    return HttpResponse(None)


def loadMatlabEng():
    startengview = time.time()
    global engview
    engview = matlab.engine.start_matlab()
    engview.addpath(r'./align_fp/', nargout=0)
    endengview = time.time()
    print(' matlab.engineview time: %s Seconds' % (endengview - startengview))


def loadRetrieval():
    global tf_train, centroids, clusters
    t1 = time.time()
    tf_train = np.load('./retrieval/tf_train.npy')
    centroids = np.load('./retrieval/centroids_train.npy')
    clusters = np.load('./retrieval/clusters_train.npy')
    t2 = time.time()
    print('load tf/centroids/clusters', t2 - t1)


def getTestData():
    start = time.time()
    global test_data, testNameList, trainNameList
 
    test_data = pickle.load(open('./static/Data/data_test_converted.pkl', 'rb'))
    test_data, testNameList, trainNameList = test_data['data'], list(test_data['testNameList']), list(
        test_data['trainNameList'])
    end = time.time()
    print('getTestData time: %s Seconds' % (end - start))


def getTrainData():
    start = time.time()
    global train_data, trainNameList, trainTF, train_data_eNum, train_data_rNum
    
    train_data = pickle.load(open('./static/Data/data_train_converted.pkl', 'rb'))
    train_data, trainNameList, trainTF = train_data['data'], list(train_data['nameList']), list(train_data['trainTF'])
    
    train_data_eNum = pickle.load(open('./static/Data/data_train_eNum.pkl', 'rb'))
    train_data_eNum = train_data_eNum['eNum']
    train_data_rNum = np.load('./static/Data/rNum_train.npy')

    end = time.time()
    print('getTrainData time: %s Seconds' % (end - start))


def loadModel():
    global model, train_data, trainNameList
    start = time.time()
    model = mltest.load_model()
    end = time.time()
    print('loadModel time: %s Seconds' % (end - start))
    start = time.time()
    test = train_data[trainNameList.index("75119")]
    mltest.test(model, FloorPlan(test, train=True))
    end = time.time()
    print('test Model time: %s Seconds' % (end - start))

def checkDraw(request):
    context = {}
    return render(request, "checkDraw/drawBoundary.html", context)
def draw_floorplan(data, output_path):
    fig, ax = plt.subplots()

    # Calculate exterior bounds
    exterior_coords = data['exterior'].strip().split()
    exterior_coords = [(float(coord.split(',')[0]), float(coord.split(',')[1])) for coord in exterior_coords]
    min_x = min(x for x, y in exterior_coords)
    max_x = max(x for x, y in exterior_coords)
    min_y = min(y for x, y in exterior_coords)
    max_y = max(y for x, y in exterior_coords)

    # Set the limits of the plot to center the floorplan
    padding = 10  # Add some padding
    ax.set_xlim(min_x - padding, max_x + padding)
    ax.set_ylim(min_y - padding, max_y + padding)

    # Draw the exterior of the floorplan
    exterior_polygon = patches.Polygon(exterior_coords, closed=True, fill=None, edgecolor='black', linewidth=3)
    ax.add_patch(exterior_polygon)

    # Highlight the first four coordinates as the main entrance with a different color
    entrance_coords = exterior_coords[:4]
    for i in range(len(entrance_coords) - 1):
        x1, y1 = entrance_coords[i]
        x2, y2 = entrance_coords[i + 1]
        ax.plot([x1, x2], [y1, y2], color='white', linewidth=3)

    # Sort rooms based on the order field in 'rmpos'
    ordered_rooms = sorted(data['rmpos'], key=lambda x: x[0], reverse=True)

    # Draw rooms in the sorted order
    for _, name, x, y, _ in ordered_rooms:
        room = next(room for room in data['roomret'] if room[1][0] == name)
        coords, _, _ = room
        room_polygon = patches.Rectangle((coords[0], coords[1]), coords[2] - coords[0], coords[3] - coords[1], fill=True, edgecolor='black', facecolor='lightgrey')
        ax.add_patch(room_polygon)
        plt.text((coords[0] + coords[2]) / 2, (coords[1] + coords[3]) / 2, name, ha='center', va='center')

    # Draw doors
    for door in data['doors']:
        _, x, y, length, _, _ = door
        ax.plot([x, x + length], [y, y], color='white', linewidth=1)

    # Draw windows
    for window in data['windowsline']:
        x1, y1, x2, y2 = window
        ax.plot([x1, x2], [y1, y2], color='black', linewidth=1)

    # Save the plot
    plt.gca().set_aspect('equal', adjustable='box')
    plt.axis('off')
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
    plt.close()
    
from django.views.decorators.csrf import csrf_exempt
@csrf_exempt
def save_floorplan_image(request):
    
    print("......")
    output_path = './static/floorplan.png'

# Draw the floorplan
    draw_floorplan(information, output_path)
    print(information)

    return HttpResponse('Lưu hình ảnh thành công.')

@csrf_exempt
def save_canvas_image(request):
    image_name = request.POST.get("imageName")
    image_data = request.POST.get('imageData')  # Lấy dữ liệu hình ảnh từ request
    print(image_data)
    image_data = image_data.split(",")[1]  # Lấy phần dữ liệu hình ảnh sau dấu phẩy
    image_data = base64.b64decode(image_data)  # Giải mã dữ liệu hình ảnh

    # Tạo hình ảnh từ dữ liệu
    image = Image.open(io.BytesIO(image_data))

    # Tạo hình ảnh mới với nền màu trắng
    new_image = Image.new('RGB', image.size, (255, 255, 255))
    new_image.paste(image, (0, 0), image)

    #image_name = 'canvas_converted.png'  # Tên cho tập tin hình ảnh
    image_path = 'D:/TranTrang/PythonCode/G2/Graph2plan-master/Interface/static/Data/Img/' + image_name  # Đường dẫn để lưu hình 
    #image_path = 'D:/TranTrang/PythonCode/FloorplanToBlender3d-master/FloorplanToBlender3d-master/Images/Examples/' + image_name
    # Kiểm tra xem ảnh đó đã tồn tại chưa nếu tồn tại rồi thì xóa đi để lưu ảnh mới thế vào
    if os.path.exists(image_path):
        os.remove(image_path)  # Xóa tệp cũ
    
    # Lưu hình ảnh mới vào tập tin
    new_image.save(image_path)

    return HttpResponse('Lưu hình ảnh thành công.')
@csrf_exempt
def save_new_data(request):
    global test_data
    global testNameList
    boundaryData = request.POST.get('boundary')
    #boundary = np.array[1]
    vertices = boundaryData.split(";")
    for i in range(len(vertices)):
        vertices[i] = vertices[i].split(",")
        for j in range(len(vertices[i])):
            vertices[i][j] = int(vertices[i][j])
    vertices = np.array(vertices)

    new_struct = sio.matlab.mat_struct()
    new_struct.boundary = vertices
    new_struct.tf = np.random.randint(0, 2)
    new_struct.topK = np.random.randint(0, 100)
    new_struct.topK_rNum = np.random.randint(0, 100)
    try:
        test_new_data = pickle.load(open('D:\TranTrang\PythonCode\G2\Graph2plan-master\Interface\static\Data\data_test_converted.pkl', 'rb'))
        #test_new_data = test_new_data['data']
    except FileNotFoundError:
        test_new_data = []
    if(test_data.size == 2881):
        test_new_data['data'][2880]= new_struct
        test_new_data['testNameList'][2880] = 'canvas_converted'
        test_data[2880]=new_struct
        testNameList[2880]='canvas_converted'
    else:
        test_new_data['data'] = np.append(test_new_data['data'], new_struct)
        test_new_data['testNameList'] = np.append(test_new_data['testNameList'], 'canvas_converted')
        testNameList.append("canvas_converted")
    test_data = test_new_data['data']
    with open('D:\TranTrang\PythonCode\G2\Graph2plan-master\Interface\static\Data\data_test_converted.pkl', 'wb') as file:
        pickle.dump(test_new_data, file)
    return HttpResponse("save_new_data success")

@csrf_exempt
def convert_svg_to_png(request):
    try:
        svg_data = request.body.decode('utf-8')

        # Chuyển đổi SVG thành hình ảnh PNG bằng Pillow
        svg_bytes = svg_data.encode('utf-8')
        svg_image = Image.open(io.BytesIO(svg_bytes))
        
        # Đường dẫn đến thư mục lưu trữ hình ảnh
        output_dir = 'D:/TranTrang/PythonCodeFloorplanToBlender3d-master/FloorplanToBlender3d-master/Images/Examples'

        # Tạo thư mục nếu nó không tồn tại
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Xóa ảnh nếu đã có
        if os.path.exists(os.path.join(output_dir, 'example.png')):
            os.remove(os.path.join(output_dir, 'example.png'))

        # Đường dẫn tệp PNG đầy đủ
        png_file_path = output_dir + '/example.png'

        # Lưu hình ảnh PNG vào thư mục
        svg_image.save(png_file_path)

        # Trả về đường dẫn tới hình ảnh PNG đã lưu
        return JsonResponse({'png_file_path': png_file_path})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
#def convert_svg_to_png(request):
    if request.method == 'POST':
        svg_data = request.POST.get('svg_data')
        if svg_data:
            # Chuyển đổi SVG thành hình ảnh PNG bằng cairosvg
            png_data = cairosvg.svg2png(bytestring=svg_data.encode())

            # Đường dẫn đến thư mục image trên ổ đĩa D
            image_dir = 'D:/TranTrang/PythonCodeFloorplanToBlender3d-master/FloorplanToBlender3d-master/Images/Examples'  # Đường dẫn thư mục trên ổ đĩa D
            if not os.path.exists(image_dir):
                os.makedirs(image_dir)
            if os.path.exists(image_dir + '/example.png'):
                os.remove(image_dir + '/example.png')

            # Tạo đường dẫn đầy đủ cho tệp PNG
            png_file_path = os.path.join(image_dir, 'example.png')

            # Lưu hình ảnh PNG vào thư mục
            with open(png_file_path, 'wb') as png_file:
                png_file.write(png_data)

            # Encode hình ảnh PNG thành base64 để truyền lại cho JavaScript (tùy chọn)
            png_base64 = base64.b64encode(png_data).decode()

            return JsonResponse({'png_file_path': png_file_path})  # Trả về đường dẫn đến hình ảnh PNG
    return JsonResponse({'error': 'Invalid request'}, status=400)

def findCommonPart(request):
    boundaryData = request.GET.get('boundary')
    roomData = request.GET.get('room')
    sub_strings = boundaryData.split(' ')
    rooms_data = roomData.split(' ')

    # Tạo một list để chứa các mảng con
    arrays_list = []
    arrays_list_room = []
    print("check findCommonPart")
    print(sub_strings)
    print(rooms_data)

    # Lặp qua từng chuỗi con
    for sub_string in sub_strings:
        # Tách chuỗi con thành các phần tử dựa trên dấu phẩy, sau đó chuyển đổi thành kiểu int
        sub_array = np.array([int(coord) for coord in sub_string.split(',')])
        corner_array = np.array([sub_array[0], sub_array[1]])
        arrays_list.append(corner_array)
 
    for sub_string in rooms_data:
        # Tách chuỗi con thành các phần tử dựa trên dấu phẩy, sau đó chuyển đổi thành kiểu int
        sub_array = np.array([int(coord) for coord in sub_string.split(',')])
        corner_array= np.array([[sub_array[0], sub_array[1]],[sub_array[0], sub_array[3]],[sub_array[2], sub_array[3]],[sub_array[2], sub_array[1]]])
        arrays_list_room.append(corner_array)

    # Chuyển đổi list thành mảng NumPy
    result_array_boundary = np.array(arrays_list)
    result_array_room = np.array(arrays_list_room)
    
    print("ta ở đây")
    print(arrays_list)
    
    stringResult=""
    polygon1 = Polygon(result_array_boundary)
    check = 1
    for room in result_array_room:
        print("Phòng thứ " + str(check))
        check+=1
        print(room)
        polygon2 = Polygon(room)
        intersection_polygon = polygon1.intersection(polygon2)

        # Kiểm tra xem phần chung có tồn tại hay không
        if intersection_polygon.is_empty:
            print("Không có phần chung giữa hai đa giác.")
        else:
            # In ra tọa độ của phần chung
            print("Phần chung giữa hai đa giác:")
            if isinstance(intersection_polygon, Polygon):  # Kiểm tra nếu phần chung là một đa giác
                for coord in intersection_polygon.exterior.coords:
                    for x in coord:
                        y = int(x)
                        stringResult = stringResult + str(y) + ","
                    stringResult = stringResult[:-1] + " "
                stringResult = stringResult[:-1]
                stringResult += "|"
            elif isinstance(intersection_polygon, MultiPolygon):  # Kiểm tra nếu phần chung là một tập hợp các đa giác
                for poly in intersection_polygon:
                    for coord in poly.exterior.coords:
                        for x in coord:
                            stringResult = stringResult + str(y) + ","
                        stringResult = stringResult[:-1] + " "
                    stringResult = stringResult[:-1]
                    stringResult += "|"
    stringResult = stringResult[:-1] 
    print(stringResult)
    return HttpResponse(json.dumps(stringResult), content_type="application/json")

def LoadTestBoundary(request):
    start = time.time()
    testName = request.GET.get('testName').split(".")[0]
    test_index = testNameList.index(testName)
    data = test_data[test_index]
    data_js = {}
    data_js["door"] = str(data.boundary[0][0]) + "," + str(data.boundary[0][1]) + "," + str(
        data.boundary[1][0]) + "," + str(data.boundary[1][1])
    ex = ""
    for i in range(len(data.boundary)):
        ex = ex + str(data.boundary[i][0]) + "," + str(data.boundary[i][1]) + " "
    data_js['exterior'] = ex
    end = time.time()
    print('LoadTestBoundary time: %s Seconds' % (end - start))
    return HttpResponse(json.dumps(data_js), content_type="application/json")


def get_filter_func(mask, acc, num):
    filters = [
        None if not mask else (
            np.equal if acc[i] else np.greater_equal
        )
        for i in range(len(mask))
    ]

    def filter_func(data):
        for i in range(len(filters)):
            if (filters[i] is not None) and (not filters[i](data[i], num[i])): return False
        return True

    return filter_func


def filter_graph(graph_):
    filters = graph_

    def filter_graphfunc(data):
        sub = data - filters
        return ((sub >= 0).all())

    return filter_graphfunc

def selectDir(request):
    name = request.GET.get('hsname')
    test_index = testNameList.index(name.split(".")[0])
    data = test_data[test_index]
    infoEdge = FindInfoEdge(data)
    data_js = {}
    data_js["door"] = str(data.boundary[0][0]) + "," + str(data.boundary[0][1]) + "," + str(
        data.boundary[1][0]) + "," + str(data.boundary[1][1])
    ex = ""
    for i in range(len(data.boundary)):
        ex = ex + str(data.boundary[i][0]) + "," + str(data.boundary[i][1]) + " "
    data_js['exterior'] = ex
    ie = ""
    for i in range(len(infoEdge)):
        ie = ie + str(infoEdge[i]) + " "
    data_js['infoEdge'] = ie
    return HttpResponse(json.dumps(data_js), content_type="application/json") 


def NumSearch(request):
    start = time.time()
    data_new = json.loads(request.GET.get("userInfo"))
    dir = request.GET.get('dir')
    testName = data_new[0].split(".")[0]
    test_index = testNameList.index(testName)
    topkList = []
    topkList.clear()
    data = test_data[test_index]
    #print(dir)
   
    multi_clusters=False
    test_data_topk = rt.retrieval(data, 1000,multi_clusters)
    
    if len(data_new) > 1:
        roomactarr = data_new[1]
        roomexaarr = data_new[2]
        roomnumarr = [int(x) for x in data_new[3]]
        
        test_num = train_data_rNum[test_data_topk]
        filter_func = get_filter_func(roomactarr, roomexaarr, roomnumarr)
        indices = np.where(list(map(filter_func, test_num)))
        indices = list(indices)
        if len(indices[0]) < 20:
            topk = len(indices[0])
        else:
            topk = 20
        topkList.clear()
        dir =  int(dir)
        #dir = 2
        idx = 0
        id = 0
        if dir == 7:
            for k in range(topk):
                topkList.append(str(trainNameList[int(test_data_topk[indices[0][k]])]) + ".png")
        else: 
            while True:
                if id == 20 or id == len(indices[0]):
                    break
                #print ("idx" + str(idx))
                train_index = trainNameList.index(str(trainNameList[int(test_data_topk[indices[0][idx]])]))
                data = train_data[train_index]
                infoEdge = FindInfoEdge(data)
                box = data.box
                box = FindBalconyBox(box)
                if box[0] == -1:
                    idx+=1
                    continue
                checkBalcony = False
                if data.boundary[0,0] == data.boundary[1,0]: # cua nam doc
                    #print("cua doc")
                    for j in range(infoEdge.size):
                        if infoEdge[j] == dir:
                            if dir == 1 or dir == 3:
                                checkBalcony = checkY(data.boundary[j], box)
                            else:
                                checkBalcony = checkX(data.boundary[j], box)
                elif(data.boundary[0,1] == data.boundary[1,1]): # cua nam ngang
                    #print("cua ngang")
                    for j in range(infoEdge.size):
                        if infoEdge[j] == dir:
                            if dir == 0 or dir == 2:
                                checkBalcony=checkY(data.boundary[j], box)
                            else:
                                checkBalcony=checkX(data.boundary[j], box) 
                if checkBalcony == False:
                    idx+=1
                    continue
                else:
                    topkList.append(str(trainNameList[int(test_data_topk[indices[0][idx]])]) + ".png")
                    id+=1
                idx+=1
    #print("dir")
    #print(dir)
    #print(topkList)
    end = time.time()
    print('NumberSearch time: %s Seconds' % (end - start))
    return HttpResponse(json.dumps(topkList), content_type="application/json")

def checkX(edge, box):
    #print("edge:")
    #print(edge)
    #print("box:")
    #print(box)
    if (box[0] == edge[0] or box[2] == edge[0]):
        return True
    return False

def checkY(edge, box):
    if(box[1] == edge[1] or box[3] == edge[1]):
        return True
    return False

def FindBalconyBox(box):
    lenBox = box.shape[0]
    for i in range(lenBox):
        if box[i, 4] == 9:
            return box[i]
    return np.full(1,-1)

def FindInfoEdge(data):
    boundary = data.boundary
    lenBoundary = boundary.shape[0]
    infoBottomEdge = np.full(lenBoundary, -1)
    dirDoor = 0 #cửa ngang
    if(boundary[0][1] == boundary[1][1]):
        dirDoor = 1 #cửa dọc
    idx = FindBottomEdge(boundary)
    infoBottomEdge[idx] = 6
    for i in range(idx, idx + lenBoundary - 1):
        if i % lenBoundary == 0:
            infoBottomEdge[1] = infoBottomEdge[lenBoundary - 1]
            continue
        if i % lenBoundary == lenBoundary - 1:
            continue
        info = FindInfo(dirDoor, infoBottomEdge[i%lenBoundary], boundary[(i + 1)%lenBoundary], boundary[(i + 2)%lenBoundary])
        if infoBottomEdge[(i+1)%lenBoundary] == -1:
            infoBottomEdge[(i+1)%lenBoundary] = info
    infoBottomEdge[0] = infoBottomEdge[1]
    infoEdge = BottomToDoor(infoBottomEdge)
    return infoEdge

def BottomToDoor(infoBottomEdge):
    inc = 0
    infoEdge = np.full(infoBottomEdge.size, -1)
    if infoBottomEdge[0] == 6:
        inc = 0
    elif infoBottomEdge[0] == 7:
        inc = 3
    elif infoBottomEdge[0] == 5:
        inc = 1
    else:
        inc = 6
    for i in range(infoBottomEdge.size):
        infoEdge[i] = (infoBottomEdge[i] + inc)%4
    return infoEdge

def FindBottomEdge(boundary):
    idx = 0
    lenBoundary = boundary.shape[0]
    for i in range(boundary.shape[0]):
        if boundary[i,1] == boundary[(i+1)%lenBoundary, 1] and boundary[i,1] >= boundary[idx,1]:
            idx = i
    if boundary[idx, 1] == boundary[(idx-1+ lenBoundary)%lenBoundary, 1]:
        idx = (idx - 1 + lenBoundary) % lenBoundary
    return idx

#thong tin canh so voi canh chua cua chinh
def FindInfo(dirDoor, infoEdge, vt, vs):
    if infoEdge == 4 or infoEdge == 6:
        if vs[1] < vt[1]:
            return  7
        else:
            return 5
    else:
        if vs[0] < vt[0]:
            return 6
        else:
            return 4
        
def FindTraindata(trainname):
    start = time.time()
    train_index = trainNameList.index(trainname)
    data = train_data[train_index]
    data_js = {}
    data_js["hsname"] = trainname

    data_js["door"] = str(data.boundary[0][0]) + "," + str(data.boundary[0][1]) + "," + str(
        data.boundary[1][0]) + "," + str(data.boundary[1][1])
    ex = ""
    for i in range(len(data.boundary)):
        ex = ex + str(data.boundary[i][0]) + "," + str(data.boundary[i][1]) + " "
    data_js['exterior'] = ex

    data_js["hsedge"] = [[int(u), int(v)] for u, v in data.edge[:, [0, 1]]]

    hsbox = [[[float(x1), float(y1), float(x2), float(y2)], [mdul.room_label[cate][1]]] for
             x1, y1, x2, y2, cate in data.box[:]]
    external = np.asarray(data.boundary)
    xmin, xmax = np.min(external[:, 0]), np.max(external[:, 0])
    ymin, ymax = np.min(external[:, 1]), np.max(external[:, 1])
    
    area_ = (ymax - ymin) * (xmax - xmin)
    
    data_js["rmsize"] = [
        [[20 * math.sqrt((float(x2) - float(x1)) * (float(y2) - float(y1)) / float(area_))], [mdul.room_label[cate][1]]]
        for
        x1, y1, x2, y2, cate in data.box[:]]
   

    box_order = data.order
    data_js["hsbox"] = []
    for i in range(len(box_order)):
        data_js["hsbox"].append(hsbox[int(float(box_order[i])) - 1])

    data_js["rmpos"] = [[int(cate), str(mdul.room_label[cate][1]), float((x1 + x2) / 2), float((y1 + y2) / 2)] for
                        x1, y1, x2, y2, cate in data.box[:]]
    end = time.time()
    print('find train data time: %s Seconds' % (end - start))
    return data_js


def LoadTrainHouse(request):
    trainname = request.GET.get("roomID").split(".")[0]
    data_js = FindTraindata(trainname)
    return HttpResponse(json.dumps(data_js), content_type="application/json")


'''
 transfer the graph of the training data into the graph of the test data
'''


def TransGraph(request):
    start = time.time()
    userInfo = request.GET.get("userInfo")
    testname = userInfo.split(',')[0]
    trainname = request.GET.get("roomID")
    selectedEdgePoint = ''.join(request.GET.get("selectedEdgePoint"))
    mlresult = mltest.get_userinfo(testname, trainname)

    fp_end = mlresult
   
    sio.savemat("./static/" + userInfo.split(',')[0].split('.')[0] + ".mat", {"data": fp_end.data})

    data_js = {}
    # fp_end  hsedge
    data_js["hsedge"] = (fp_end.get_triples(tensor=False)[:, [0, 2, 1]]).astype(float).tolist()

    # fp_rmsize
    external = np.asarray(fp_end.data.boundary)
    xmin, xmax = np.min(external[:, 0]), np.max(external[:, 0])
    ymin, ymax = np.min(external[:, 1]), np.max(external[:, 1])
    area_ = (ymax - ymin) * (xmax - xmin)
    data_js["rmsize"] = [
        [[20 * math.sqrt((float(x2) - float(x1)) * (float(y2) - float(y1)) / float(area_))], [mdul.room_label[cate][1]]]
        for
        x1, y1, x2, y2, cate in fp_end.data.box[:]]
    # fp_end rmpos

    rooms = fp_end.get_rooms(tensor=False)

    
    center = [[(x1 + x2) / 2, (y1 + y2) / 2] for x1, y1, x2, y2 in fp_end.data.box[:, :4]]

    # boxes_pred
    data_js["rmpos"] = []
    for k in range(len(center)):
        #if mdul.room_label[int(rooms[k])][1] == "Balcony" and float(selectedEdgePoint.split(',')[0])!= -1:
        #    node = float(rooms[k]), mdul.room_label[int(rooms[k])][1], float(selectedEdgePoint.split(',')[0]), float(selectedEdgePoint.split(',')[1]), float(k)
        #else:
        node = float(rooms[k]), mdul.room_label[int(rooms[k])][1], center[k][0], center[k][1], float(k)
        #print(k)
        #print(node)
        data_js["rmpos"].append(node)
    test_index = testNameList.index(testname.split(".")[0])
    data = test_data[test_index]
    ex = ""
    for i in range(len(data.boundary)):
        ex = ex + str(data.boundary[i][0]) + "," + str(data.boundary[i][1]) + " "
    data_js['exterior'] = ex
    data_js["door"] = str(data.boundary[0][0]) + "," + str(data.boundary[0][1]) + "," + str(
        data.boundary[1][0]) + "," + str(data.boundary[1][1])
    end = time.time()
    print('TransGraph time: %s Seconds' % (end - start))
    return HttpResponse(json.dumps(data_js), content_type="application/json")


def AdjustGraph(request):
    start = time.time()
    # newNode index-typename-cx-cy
    # oldNode index-typename-cx-cy
    # newEdge u-v
    global boxes_pred
    NewGraph = json.loads(request.GET.get("NewGraph"))
    testname = request.GET.get("userRoomID")
    trainname = request.GET.get("adptRoomID")
    s = time.time()
    mlresult = mltest.get_userinfo_adjust(testname, trainname, NewGraph)
    e = time.time()
    print('get_userinfo_adjust: %s Seconds' % (e - s))
    fp_end = mlresult[0]
    print("Box_pres check đây")
    boxes_pred = mlresult[1]
    data_js = {}
    data_js["hsedge"] = (fp_end.get_triples(tensor=False)[:, [0, 2, 1]]).astype(float).tolist()
  
    rooms = fp_end.get_rooms(tensor=False)
    center = [[(x1 + x2) / 2, (y1 + y2) / 2] for x1, y1, x2, y2 in fp_end.data.box[:, :4]]

    box_order = mlresult[2]
    '''
    handle the information of the room boxes 
    boxes_pred: the prediction from net
    box_order: The order in which boxes are drawn

    '''
    room = []
    for o in range(len(box_order)):
        room.append(float((rooms[int(float(box_order[o][0])) - 1])))
    boxes_end = []
    for i in range(len(box_order)):
        tmp = []
        for j in range(4):
            tmp.append(float(boxes_pred[int(float(box_order[i][0])) - 1][j]))
        boxes_end.append(tmp)
    
    data_js['roomret'] = []
    for k in range(len(room)):
        data = boxes_end[k], [mdul.room_label[int(room[k])][1]], box_order[k][0] - 1
        data_js['roomret'].append(data)
    
    # change the box size
    global relbox
    relbox = data_js['roomret']
    global reledge
    reledge = data_js["hsedge"]

    test_index = testNameList.index(testname.split(".")[0])
    data = test_data[test_index]
    ex = ""
    for i in range(len(data.boundary)):
        ex = ex + str(data.boundary[i][0]) + "," + str(data.boundary[i][1]) + " "
    data_js['exterior'] = ex
    data_js["door"] = str(data.boundary[0][0]) + "," + str(data.boundary[0][1]) + "," + str(
        data.boundary[1][0]) + "," + str(data.boundary[1][1])

    external = np.asarray(data.boundary)
    xmin, xmax = np.min(external[:, 0]), np.max(external[:, 0])
    ymin, ymax = np.min(external[:, 1]), np.max(external[:, 1])
    area_ = (ymax - ymin) * (xmax - xmin)
    data_js['rmsize'] = []
    for i in range(len(data_js['roomret'])):
        rmsize = 20 * math.sqrt((float(data_js['roomret'][i][0][2]) - float(data_js['roomret'][i][0][0])) * (
                float(data_js['roomret'][i][0][3]) - float(data_js['roomret'][i][0][1])) / float(area_)), \
                 data_js["roomret"][i][1][0]
        data_js["rmsize"].append(rmsize)

    data_js["rmpos"] = []

    newGraph = NewGraph[0]
    for i in range(len(data_js['roomret'])):
        for k in range(len(newGraph)):
            if (data_js['roomret'][i][1][0] == newGraph[k][1]):
                x_center = int((data_js['roomret'][i][0][0] + data_js['roomret'][i][0][2]) / 2)
                y_center = int((data_js['roomret'][i][0][1] + data_js['roomret'][i][0][3]) / 2)
                x_graph = newGraph[k][2]
                y_graph = newGraph[k][3]
                if ((int(x_graph - 30) < x_center < int(x_graph + 30))):
                    node = float(rooms[k]), newGraph[k][1], x_center, y_center, float(
                        newGraph[k][0])
                    data_js["rmpos"].append(node)
                    newGraph.pop(k)
                    break
                if ((int(y_graph - 30) < y_center < int(y_graph + 30))):
                    node = float(rooms[k]), newGraph[k][1], x_center, y_center, float(
                        newGraph[k][0])
                    data_js["rmpos"].append(node)
                    newGraph.pop(k)

                    break
    
    fp_end.data = add_dw_fp(fp_end.data)
    data_js["indoor"] = []
    
    boundary = data.boundary
    
    isNew = boundary[:, 3]
    frontDoor = boundary[[0, 1]]  
    frontDoor = frontDoor[:, [0, 1]]  
    frontsum = frontDoor.sum(axis=1).tolist()
    idx = frontsum.index(min(frontsum))
    wallThickness = 3
    if idx == 1:
        frontDoor = frontDoor[[1, 0], :]
    orient = boundary[0][2]
    if orient == 0 or orient == 2:
        frontDoor[0][0] = frontDoor[0][0] + wallThickness / 4
        frontDoor[1][0] = frontDoor[1][0] - wallThickness / 4
    if orient == 1 or orient == 3:
        frontDoor[0][1] = frontDoor[0][1] + wallThickness / 4
        frontDoor[1][1] = frontDoor[1][1] - wallThickness / 4
    #boundary_mat = matlab.double(boundary)
    #rType_mat = matlab.double(data_js['roomret'][1])
    #Edge_mat = matlab.double(data_js['roomret'][2])
    #Box_mat=matlab.double(data_js['roomret'][0])
    room_data = [data_js['roomret']]
    data_numeric = []
    room_types = [room[1][0] for room in data_js['roomret']]

    for item in room_types:
        room_name = item
        if room_name == 'LivingRoom':
            data_numeric.append(0)
        elif room_name == 'MasterRoom':
            data_numeric.append(1)
        elif room_name == 'Kitchen':
            data_numeric.append(2)
        elif room_name == 'Bathroom':
            data_numeric.append(3)
        elif room_name == 'DiningRoom':
            data_numeric.append(4)
        elif room_name == 'ChildRoom':
            data_numeric.append(5)
        elif room_name == 'StudyRoom':
            data_numeric.append(6)
        elif room_name == 'SecondRoom':
            data_numeric.append(7)
        elif room_name == 'GuestRoom':
            data_numeric.append(8)
        elif room_name == 'Balcony':
            data_numeric.append(9)
        elif room_name == 'Entrance':
            data_numeric.append(10)
        elif room_name == 'Storage':
            data_numeric.append(11)
        elif room_name == 'Wall-in':
            data_numeric.append(12)
        elif room_name == 'External':
            data_numeric.append(13)
        elif room_name == 'ExteriorWall':
            data_numeric.append(14)
        elif room_name == 'FrontDoor':
            data_numeric.append(15)
        elif room_name == 'InteriorWall':
            data_numeric.append(16)
        elif room_name == 'InteriorDoor':
            data_numeric.append(17)
    #data_numeric = [mapping_dict[item] for item in room_data]
    
    room_positions = [room[0] for room in data_js['roomret']]
    
    room_boundaries = mlresult[5]
    for att in range(len(room_boundaries)):
        room_boundaries[att] = np.array(room_boundaries[att])
    #room_boundaries = np.array(room_boundaries)

    dataout = sio.matlab.mio5_params.mat_struct()
    dataout.boundary = np.array(boundary)
    dataout.rType = np.array(data_numeric, dtype = int)
    dataout.rBoundary = room_boundaries
    dataout.newBox = np.array(room_positions, dtype = int)
    #print(dir(data))

    for attribute in dir(dataout):
            if not attribute.startswith('__'):  # Loại bỏ các thuộc tính bắt đầu bằng '__' (các phương thức và thuộc tính ẩn)
                value = getattr(dataout, attribute)

    doors,windows = add_door_window(dataout)
    

    data_js["doors"] = np.array(doors, dtype = int).tolist()

    data_js["windows"] = []
    for indx, x, y, w, h, r in fp_end.data.windows:
        if w != 0:
            tmp = [x + 2, y - 2, w - 2, 4]
            data_js["windows"].append(tmp)
        if h != 0:
            tmp = [x - 2, y, 4, h]
            data_js["windows"].append(tmp)
    data_js["windowsline"] = []
    for indx, x, y, w, h, r in fp_end.data.windows:
        if w != 0:
            tmp = [x + 2, y, w + x, y]
            data_js["windowsline"].append(tmp)
        if h != 0:
            tmp = [x, y, x, h + y]
            data_js["windowsline"].append(tmp)
    
    sio.savemat("./static/" + testname.split(',')[0].split('.')[0] + ".mat", {"data": fp_end.data})

    end = time.time()
    global information
    information = data_js
    #information["boundary"] = boundary
    print("Test chuyển đổi code python")
    #mltest.align_info_python(mlresult[6], mlresult[7], mlresult[8], mlresult[9], mlresult[10], mlresult[11])
    print('AdjustGraph time: %s Seconds' % (end - start))
    return HttpResponse(json.dumps(data_js), content_type="application/json")


def RelBox(request):
    id = request.GET.get("selectRect")
    global relbox
    global reledge
    rdirgroup=get_dir(id,relbox,reledge)
    return HttpResponse(json.dumps(rdirgroup), content_type="application/json")

def get_dir(id,relbox,reledge):
    rel = []
    selectindex = int(id.split("_")[1])
    select = np.zeros(4).astype(int)
    for i in range(len(relbox)):
        a = math.ceil(relbox[i][0][0]), math.ceil(relbox[i][0][1]), math.ceil(relbox[i][0][2]), math.ceil(
            relbox[i][0][3]), int(relbox[i][2])
        rel.append(a)
        if (selectindex == int(relbox[i][2])):
            # select:x1,x0,y0,y1.relbox:x0,y0,x1,y1
            select[0] = math.ceil(relbox[i][0][2])
            select[1] = math.ceil(relbox[i][0][0])
            select[2] = math.ceil(relbox[i][0][1])
            select[3] = math.ceil(relbox[i][0][3])
    rel = np.array(rel)
    df = pd.DataFrame({'x0': rel[:, 0], 'y0': rel[:, 1], 'x1': rel[:, 2], 'y1': rel[:, 3], 'rindex': rel[:, 4]})
    group_label = [(0, 'x1', "right"),
                   (1, 'x0', "left"),
                   (2, 'y0', "top"),
                   (3, 'y1', "down")]
    dfgroup = []
    for i in range(len(group_label)):
        dfgroup.append(df.groupby(group_label[i][1], as_index=True).get_group(name=select[i]))
    rdirgroup = []
    for i in range(len(dfgroup)):
        dir = dfgroup[i]
        rdir = []
        for k in range(len(dir)):
            idx = (dir.loc[dir['rindex'] == (dir.iloc[[k]].values)[0][4]].index.values)[0]
            rdir.append(relbox[idx][1][0].__str__() + "_" + (dir.iloc[[k]].values)[0][4].__str__())
        rdirgroup.append(rdir)
    reledge = np.array(reledge)
    data1 = reledge[np.where((reledge[:, [0]] == selectindex))[0]]
    data2 = reledge[np.where((reledge[:, [1]] == selectindex))[0]]
    reledge1 = np.vstack((data1, data2))
    return rdirgroup
def Save_Editbox(request):
    print("bắt đầu save ở đây")
    global indxlist,boxes_pred
    NewGraph = json.loads(request.GET.get("NewGraph"))
    NewLay = json.loads(request.GET.get("NewLay"))
    userRoomID = request.GET.get("userRoomID")
    adptRoomID = request.GET.get("adptRoomID")
    
    NewLay=np.array(NewLay)
    NewLay=NewLay[np.argsort(NewLay[:, 1])][:,2:]
    NewLay=NewLay.astype(float).tolist()

    test_index = testNameList.index(userRoomID.split(".")[0])
    test_ = test_data[test_index]
    
    Boundary = test_.boundary
    boundary=[[float(x),float(y),float(z),float(k)] for x,y,z,k in list(Boundary)]
    test_fp =FloorPlan(test_)

    train_index = trainNameList.index(adptRoomID.split(".")[0])
    train_ =train_data[train_index]
    train_fp =FloorPlan(train_,train=True)
    fp_end = test_fp.adapt_graph(train_fp)
    fp_end.adjust_graph()
    newNode = NewGraph[0]
    newEdge = NewGraph[1]
    oldNode = NewGraph[2]
    temp = []
    for newindx, newrmname, newx, newy,scalesize in newNode:
        for type, oldrmname, oldx, oldy, oldindx in oldNode:
            if (int(newindx) == oldindx):
                tmp=int(newindx), (newx - oldx), ( newy- oldy),float(scalesize)
                temp.append(tmp)
    newbox=[]
    if mltest.adjust==True:
        oldbox = []
        for i in range(len(boxes_pred)):
            indxtmp=[boxes_pred[i][0],boxes_pred[i][1],boxes_pred[i][2],boxes_pred[i][3],boxes_pred[i][0]]
            oldbox.append(indxtmp)
    if mltest.adjust==False:
        indxlist=[]
        oldbox=fp_end.data.box.tolist()
        for i in range(len(oldbox)):
            indxlist.append([oldbox[i][4]])
        indxlist=np.array(indxlist)
        adjust=True
    oldbox=fp_end.data.box.tolist()
    X=0
    Y=0
    for i in range(len(oldbox)):
        X= X+(oldbox[i][2]-oldbox[i][0])
        Y= Y+(oldbox[i][3]-oldbox[i][1])
    x_ave=(X/len(oldbox))/2
    y_ave=(Y/len(oldbox))/2

    index_mapping = {}
    #  The room that already exists
    #  Move: Just by the distance
    for newindx, tempx, tempy,scalesize in temp:
        index_mapping[newindx] = len(newbox)
        tmpbox=[]
        scalesize = int(scalesize)
        if scalesize<1:
            scale = math.sqrt(scalesize)
            scalex = (oldbox[newindx][2] - oldbox[newindx][0]) * (1 - scale) / 2
            scaley = (oldbox[newindx][3] - oldbox[newindx][1]) * (1 - scale) / 2
            tmpbox = [(oldbox[newindx][0] + tempx) + scalex, (oldbox[newindx][1] + tempy)+scaley,
                      (oldbox[newindx][2] + tempx) - scalex, (oldbox[newindx][3] + tempy) - scaley, oldbox[newindx][4]]
        if scalesize == 1:
            tmpbox = [(oldbox[newindx][0] + tempx) , (oldbox[newindx][1] + tempy) ,(oldbox[newindx][2] + tempx), (oldbox[newindx][3] + tempy), oldbox[newindx][4]]

        if scalesize>1:
            scale=math.sqrt(scalesize)
            scalex = (oldbox[newindx][2] - oldbox[newindx][0]) * ( scale-1) / 2
            scaley = (oldbox[newindx][3] - oldbox[newindx][1]) * (scale-1) / 2
            tmpbox = [(oldbox[newindx][0] + tempx) - scalex, (oldbox[newindx][1] + tempy) - scaley,
                      (oldbox[newindx][2] + tempx) + scalex, (oldbox[newindx][3] + tempy) + scaley, oldbox[newindx][4]]

        newbox.append(tmpbox)

    #  The room just added
    #  Move: The room node with the average size of the existing room
    for newindx, newrmname, newx, newy,scalesize in newNode:
        if int(newindx)>(len(oldbox)-1):
            scalesize=int(scalesize)
            index_mapping[int(newindx)] = (len(newbox))
            tmpbox=[]
            if scalesize < 1:
                scale = math.sqrt(scalesize)
                scalex = x_ave * (1 - scale) / 2
                scaley = y_ave* (1 - scale) / 2
                tmpbox = [(newx-x_ave) +scalex,(newy-y_ave) +scaley,(newx+x_ave)-scalex,(newy+y_ave)-scaley,vocab['object_name_to_idx'][newrmname]]

            if scalesize == 1:
                tmpbox = [(newx - x_ave), (newy - y_ave), (newx + x_ave), (newy + y_ave),vocab['object_name_to_idx'][newrmname]]
            if scalesize > 1:
                scale = math.sqrt(scalesize)
                scalex = x_ave * (scale - 1) / 2
                scaley = y_ave * (scale - 1) / 2
                tmpbox = [(newx-x_ave) - scalex, (newy-y_ave)  - scaley,(newx+x_ave) + scalex, (newy+y_ave) + scaley,vocab['object_name_to_idx'][newrmname]]
            # tmpboxin = [(newx-x_ave) ,(newy-y_ave) ,(newx+x_ave) ,(newy+y_ave) ,vocab['object_name_to_idx'][newrmname]]
            # print(tmpboxin)
            # print(tmpbox)
            # print(scalesize)
            newbox.append(tmpbox)

    fp_end.data.box=np.array(newbox)
    
    adjust_Edge=[]
    for u, v in newEdge:
        tmp=[index_mapping[int(u)],index_mapping[int(v)], 0]
        adjust_Edge.append(tmp)
    fp_end.data.edge=np.array(adjust_Edge)
    rType = fp_end.get_rooms(tensor=False)

    rEdge = fp_end.get_triples(tensor=False)[:, [0, 2, 1]]
    Edge = [[float(u), float(v), float(type2)] for u, v, type2 in rEdge]
    Box=NewLay
    boundary_mat = matlab.double(boundary)
    rType_mat = matlab.double(rType.tolist())
    Edge_mat = matlab.double(Edge)
    Box_mat=matlab.double(Box)
    fp_end.data.boundary =np.array(boundary)
    fp_end.data.rType =np.array(rType).astype(int)
    fp_end.data.refineBox=np.array(Box)
    fp_end.data.rEdge=np.array(Edge)

    box_refine = engview.align_fp(boundary_mat, Box_mat,  rType_mat,Edge_mat ,18,False, nargout=3)
    box_out=box_refine[0]
    box_order=box_refine[1]
    rBoundary=box_refine[2]
    fp_end.data.newBox = np.array(box_out)
    fp_end.data.order = np.array(box_order)
    fp_end.data.rBoundary = [np.array(rb) for rb in rBoundary]
    fp_end.data = add_dw_fp(fp_end.data)
    sio.savemat("./static/" + userRoomID + ".mat", {"data": fp_end.data})
    print("save ở đây")
    #print(type(fp_end.data))
    print(fp_end.data)
    flag=1
    return HttpResponse(json.dumps(flag), content_type="application/json")


def TransGraph_net(request):
    userInfo = request.GET.get("userInfo")
    testname = userInfo.split(',')[0]
    trainname = request.GET.get("roomID")
    mlresult = mltest.get_userinfo_net(testname, trainname)

    fp_end = mlresult[0]
    boxes_pred = mlresult[1]

    data_js = {}
    # fp_end  hsedge
    data_js["hsedge"] = (fp_end.get_triples(tensor=False)[:, [0, 2, 1]]).astype(float).tolist()

    # fp_end rmpos
    rooms = fp_end.get_rooms(tensor=False)
    room = rooms
    center = [[(x1 + x2) / 2, (y1 + y2) / 2] for x1, y1, x2, y2 in fp_end.data.box[:, :4]]

    

    # boxes_pred
    data_js["rmpos"] = []
    for k in range(len(center)):
        node = float(room[k]), mdul.room_label[int(room[k])][1], center[k][0], center[k][1]
        data_js["rmpos"].append(node)
    boxes_end = boxes_pred.tolist()
    data_js['roomret'] = []
    for k in range(len(room)):
        data = boxes_end[k], [mdul.room_label[int(room[k])][1]]
        data_js['roomret'].append(data)

    test_index = testNameList.index(testname.split(".")[0])
    data = test_data[test_index]
    ex = ""
    for i in range(len(data.boundary)):
        ex = ex + str(data.boundary[i][0]) + "," + str(data.boundary[i][1]) + " "
    data_js['exterior'] = ex
    x0, x1 = np.min(data.boundary[:, 0]), np.max(data.boundary[:, 0])
    y0, y1 = np.min(data.boundary[:, 1]), np.max(data.boundary[:, 1])
    data_js['bbxarea'] = float((x1 - x0) * (y1 - y0))
    return HttpResponse(json.dumps(data_js), content_type="application/json")


def GraphSearch(request):
    s=time.time()
    # Graph
    Searchtype = ["BedRoom", "Bathroom", "Kitchen", "Balcony", "Storage"]
    BedRoomlist = ["MasterRoom", "SecondRoom", "GuestRoom", "ChildRoom", "StudyRoom"]
    NewGraph = json.loads(request.GET.get("NewGraph"))
   
    testname = request.GET.get("userRoomID")
    newNode = NewGraph[0]
    newEdge = NewGraph[1]
    r_Num = np.zeros((1, 14)).tolist()
    r_Mask = np.zeros((1, 14)).tolist()
    r_Acc = np.zeros((1, 14)).tolist()
    r_Num[0][0] = 1
    r_Mask[0][0] = 1
    r_Acc[0][0] = 1

    for indx, rmname, x, y, scalesize in newNode:
        r_Num[0][mdul.vocab['object_name_to_idx'][rmname]] = r_Num[0][mdul.vocab['object_name_to_idx'][rmname]] + 1
        r_Mask[0][mdul.vocab['object_name_to_idx'][rmname]] = 1
        if rmname in BedRoomlist:
            r_Num[0][13] = r_Num[0][13] + 1
            r_Mask[0][13] = 1

    test_index = testNameList.index(testname.split(".")[0])
    topkList = []
    topkList.clear()
    data = test_data[test_index]
   
    Numrooms = json.loads(request.GET.get("Numrooms"))
    

    roomactarr = Numrooms[0]
    roomexaarr = Numrooms[1]
    roomnumarr = [int(x) for x in Numrooms[2]]
    test_data_topk=np.arange(0,74995)

    if np.sum(roomactarr) != 1 or np.sum(roomexaarr) != 1 or np.sum(roomnumarr) != 1:
        test_num = train_data_rNum[test_data_topk]
        # Number filter
     
        filter_func = get_filter_func(roomactarr, roomexaarr, roomnumarr)
        indices = np.where(list(map(filter_func, test_num)))
        # print("np.where(list(map(fil", test_num)
        indices = list(indices)
        test_data_topk = test_data_topk[indices[0]]

    test_num = train_data_eNum[test_data_topk]
    # Graph filter
    
    edgematrix = np.zeros((5, 5))
    for indx1, indx2 in newEdge:
        tmp1 = ""
        tmp2 = ""
        for indx, rmname, x, y, scalesize in newNode:
            if indx1 == indx:
                if rmname in BedRoomlist:
                    tmp1 = "BedRoom"
                else:
                    tmp1 = rmname
        for indx, rmname, x, y, scalesize in newNode:
            if indx2 == indx:
                if rmname in BedRoomlist:
                    tmp2 = "BedRoom"
                else:
                    tmp2 = rmname
        if tmp1 != "" and tmp2 != "":
            edgematrix[Searchtype.index(tmp1)][Searchtype.index(tmp2)] = edgematrix[Searchtype.index(tmp1)][
                                                                             Searchtype.index(tmp2)] + 1
            edgematrix[Searchtype.index(tmp2)][Searchtype.index(tmp1)] = edgematrix[Searchtype.index(tmp2)][
                                                                             Searchtype.index(tmp1)] + 1
    edge = edgematrix.reshape((1, 25))
    filter_graphfunc = filter_graph(edge)
    # rNum_list
    eNumData = []
   
    indices = np.where(list(map(filter_graphfunc, test_num)))

    indices = list(indices)
    tf_trainsub=tf_train[test_data_topk[indices[0]]]
    re_data = train_data[test_data_topk[indices[0]]]
    test_data_tftopk=retrieve_bf(tf_trainsub, data, k=20)
    re_data=re_data[test_data_tftopk]
    if len(re_data) < 20:
        topk = len(re_data)
    else:
        topk = 20
    topkList = []
    for i in range(topk):
        topkList.append(str(re_data[i].name) + ".png")
        
    e=time.time()
    print('Graph Search time: %s Seconds' % (e - s))

    return HttpResponse(json.dumps(topkList), content_type="application/json")


def retrieve_bf(tf_trainsub, datum, k=20):
    # compute tf for the data boundary
    x, y = rt.compute_tf(datum.boundary)
    y_sampled = rt.sample_tf(x, y, 1000)
    dist = np.linalg.norm(y_sampled - tf_trainsub, axis=1)
    if k > np.log2(len(tf_trainsub)):
        index = np.argsort(dist)[:k]
    else:
        index = np.argpartition(dist, k)[:k]
        index = index[np.argsort(dist[index])]
    return index


if __name__ == "__main__":
    pass