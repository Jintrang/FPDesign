import numpy as np
import matlab
import matlab.engine as engine
import os
import sys
#from .matlab_to_python import align_fp as af
print("__________________________________--")
print(sys.getrecursionlimit())
sys.setrecursionlimit(3000)
#from matlab_to_python import align_fp
eng = engine.start_matlab()
eng.addpath(os.path.join(os.path.dirname(__file__),'matlab'),nargout=0)

GT_ThRESHOLD = 6
PRED_ThRESHOLD = 12
REFINE_ThRESHOLD = 18

def align_fp(boundary, boxes, types, edges, image, threshold, dtype=int):
    boundary = np.array(boundary,dtype=int).tolist()
    boxes    = np.array(boxes,dtype=int).tolist()
    types    = np.array(types,dtype=int).tolist()
    edges    = np.array(edges,dtype=int).tolist()
    image    = np.array(image,dtype=int).tolist()
    
    boxes_aligned, order, room_boundaries = eng.align_fp(
        matlab.double(boundary),
        matlab.double(boxes),
        matlab.double(types),
        matlab.double(edges),
        matlab.double(image),
        threshold,False,nargout=3
    )
    boxes_aligned   = np.array(boxes_aligned,dtype=dtype)
    order           = np.array(order,dtype=dtype).reshape(-1)-1
    room_boundaries = np.array([np.resize((np.array(rb[0],dtype=object)), (8, 2)) for rb in room_boundaries]) # poly with hole has value 'nan'

    
    #edges = np.array(edges)
    #edges[:,0] = edges[:, 0] -1
    #edges[:,1] = edges[:, 1] -1
    print("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\///////////////////////////")
    print(boundary)
    print(boxes)
    print(types)
    print(edges)
    result = af.align_fp(np.array(boundary), np.array(boxes), np.array(types), edges, np.array(image), np.array(threshold), False)

    boxes_aligned   = np.array(result[0],dtype=dtype)
    order           = np.array(result[1],dtype=dtype).reshape(-1)
    room_boundaries = np.array([np.resize((np.array(rb[0],dtype=object)), (8, 2)) for rb in result[2]]) # poly with hole has value 'nan'
    print(boxes_aligned)
    print(order)
    print(room_boundaries)
    return boxes_aligned, order, room_boundaries

def align_fp_gt(boundary, boxes, types, edges, dtype=int):
    return align_fp(boundary, boxes, types, edges, [], GT_ThRESHOLD, dtype)

def align_fp_pred(boundary, boxes, types, edges, dtype=int):
    return align_fp(boundary, boxes, types, edges, [], PRED_ThRESHOLD, dtype)

def align_fp_refine(boundary, boxes, types, edges, image, dtype=int):
    return align_fp(boundary, boxes, types, edges, image, REFINE_ThRESHOLD, dtype)