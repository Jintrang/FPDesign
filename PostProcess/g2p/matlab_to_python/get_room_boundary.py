from shapely.geometry import Polygon
import numpy as np
def get_room_boundary(box, boundary, order):
    isNew = np.where(boundary[:,3] == 0)
    coords = boundary[:, 0:2]
    coords = coords[isNew, :]
    coords = coords[0]
    polyBoundary = Polygon(coords)

    poly = np.empty((len(box), 1), dtype = Polygon)
    for i in range(len(box)):
        poly[i][0] = Polygon([(box[i, 0], box[i, 1]), (box[i, 0], box[i, 3]), (box[i, 2], box[i, 3]),(box[i, 2], box[i, 1])])

    newBox = box.copy()
    rBoundary = np.empty((len(box), 1), dtype = object)
    for i in range(len(box)):
        idx = order[i]
        rPoly = polyBoundary.intersection(poly[idx][0])
        for j in range(i+1,len(box)):
            rpoly1 = poly[order[j]][0]
            rPoly = rPoly.difference(rpoly1)
        
        rBoundary[idx][0] = np.array(rPoly.exterior.coords)
        if rPoly.is_empty == False:
            #xLimit, yLimit = rPoly.bounds
            #newBox[idx, :] = [xLimit[0], yLimit[0], xLimit[1], yLimit[1]]
            newBox[idx, :] = list(rPoly.bounds)
    #rBoundary = rBoundary[:,0:5]
    for i in range(len(rBoundary)):
    # Bỏ hàng cuối cùng của mảng con
        rBoundary[i][0] = rBoundary[i][0][:-1]
        rBoundary[i][0] = rBoundary[i][0][(-rBoundary[i][0][:,0]).argsort(axis = -1)]
  
        #print(len(rBoundary[i][0])/2)
        j = 1
        while True:
            if j == len(rBoundary[i][0])-1:
                break
            if rBoundary[i][0][j - 1, 0] == rBoundary[i][0][j + 1, 0]:
                rBoundary[i][0] = np.delete(rBoundary[i][0], j, axis=0)
                j-=1
            j += 1
        rBoundary[i][0] = rBoundary[i][0][(-rBoundary[i][0][:,1]).argsort(axis = -1)]
        j = 1
        while True:
            if j == len(rBoundary[i][0])-1:
                break
            if rBoundary[i][0][j - 1, 1] == rBoundary[i][0][j + 1, 1]:
                rBoundary[i][0] = np.delete(rBoundary[i][0], j, axis=0)
                j-=1
            j += 1
        rBoundary[i][0] = rBoundary[i][0][(-rBoundary[i][0][:,0]).argsort(axis = -1)]

        check = np.zeros((int(len(rBoundary[i][0])/2)), dtype = bool)
        idxCheck = np.ones((int(len(rBoundary[i][0])/2))) * (-1)
        j = 0
        num = 0
        check[j]= True
        idxCheck[num] = j
        countcheck = 0
        while True:
            if countcheck == int(len(rBoundary[i][0])/2-1 ):
                break
            for k in range(int(len(rBoundary[i][0])/2)):
                if check[k] != True:
                    if rBoundary[i][0][(k+1)*2-2, 1] == rBoundary[i][0][(j+1)*2-1, 1]:
                        check[k] = True
                        num +=1
                        idxCheck[num] = k
                        j = k
                        countcheck +=1
                        break
                    elif rBoundary[i][0][(k+1)*2-1, 1] == rBoundary[i][0][(j+1)*2-1, 1]:
                        check[k] = True
                        num1 = rBoundary[i][0][(k+1)*2-1, 1]
                        rBoundary[i][0][(k+1)*2-1, 1] = rBoundary[i][0][(k+1)*2-2, 1]
                        rBoundary[i][0][(k+1)*2-2, 1] = num1
                        num +=1
                        idxCheck[num] = k
                        j = k
                        countcheck +=1
                        break
        print("herre")
        print(rBoundary)
        for j in range(int(len(rBoundary[i][0])/2)-1):
            if j == 0:
                j+=1
            k = int(idxCheck[j])
            num1 = rBoundary[i][0][(k+1)*2-1,:]
            rBoundary[i][0][(k+1)*2-1,:] = rBoundary[i][0][(j+1)*2-1,:]
            rBoundary[i][0][(j+1)*2-1,:] = num1
            num2 = rBoundary[i][0][(k+1)*2-2,:]
            rBoundary[i][0][(k+1)*2-2,:] = rBoundary[i][0][(j+1)*2-2,:]
            rBoundary[i][0][(j+1)*2-2,:] = num2

            
        #rBoundary[i] = rBoundary[i][0]
    return newBox, rBoundary