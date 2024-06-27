import os
import sys

# Lấy đường dẫn tuyệt đối của thư mục cha (thư mục 'b')
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Thêm đường dẫn tuyệt đối của thư mục 'b' vào sys.path
sys.path.insert(0, parent_dir)

import numpy as np
import matplotlib.pyplot as plt
from plot import plot_fp
from matlab_to_python import get_entrance_space
from matlab_to_python import get_room_boundary
from matlab_to_python import align_with_boundary
from matlab_to_python import align_neighbor
from matlab_to_python import regularize_fp
def align_fp(boundary, rBox, rType, rEdge, fp, threshold, drawResult=False):
    if len(sys.argv) < 7:
        drawResult = False

    livingIdx = np.where(rType == 0)[0]
    idx = np.where(np.logical_and((rEdge[:, 0] != (int(livingIdx)-1)),(rEdge[:, 1] != (int(livingIdx) -1))))
    rEdge = rEdge[idx, :]
    entranceBox = get_entrance_space.get_entrance_space(boundary[0:2, 0:2], boundary[0, 2], threshold)

    if drawResult:
        plt.subplot(2, 2, 1)
        plot_fp(rBox, boundary, rType, entranceBox)
        plt.title('original')
    
    resuld = align_with_boundary.align_with_boundary(rBox, boundary, threshold, rType)
    newBox = resuld[1]
    updated = resuld[2]
    
    print("align_with_boundary")

    if drawResult:
        plt.subplot(2, 2, 2)
        plot_fp(newBox, boundary, rType, entranceBox)
        plt.title('Align with boundary')
    resuld = align_neighbor.align_neighbor(newBox, rEdge, updated, threshold + 6)
    newBox = resuld[1]
    print("align_neighbor")
    print(newBox)
    if drawResult:
        plt.subplot(2, 2, 3)
        plot_fp(newBox, boundary, rType, entranceBox)
        plt.title('Align with neighbors')

    newBox, order = regularize_fp.regularize_fp(newBox, boundary, rType)
    print("regularize_fp")
    print(newBox)
    print(order)
    newBox, rBoundary = get_room_boundary.get_room_boundary(newBox, boundary, order)
    print("get_room_boundary")
    print(newBox)
    print("2")
    print(rBoundary)
    
    if drawResult:
        plt.subplot(2, 2, 4)
        plot_fp(newBox[order, :], boundary, rType[order], entranceBox)
        plt.title('Regularize fp')

    return newBox, order, rBoundary