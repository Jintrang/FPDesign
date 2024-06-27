# Online Python compiler (interpreter) to run Python online.
# Write Python 3 code in this online editor and run it.
from shapely.geometry import Polygon
from shapely.ops import cascaded_union
from shapely.affinity import translate
import numpy as np
import find_room_order
import align_with_boundary
import align_neighbor
from shapely.geometry import GeometryCollection
import regularize_fp
import get_room_boundary
import align_fp


boundary = np.array([[90,181,3,1],[90,163,3,1],[90,157,2,0],[86,157,3,0],[86,124,2,0],[69,124,3,0],[69,24,0,0],[117,24,1,0],[117,54,0,0],[188,54,1,0],[188,139,2,0],[167,139,1,0],[167,185,0,0],[174,185,1,0],[174,233,2,0],[90,233,3,0]])
rBox = np.array([[82,25,121,47],[72,54,147,201],[89,193,127,241],[127,189,167,237],[136,154,171,190],[164,115,189,151],[139,42,186,114],[139,119,163,148]])
rType = np.array([9,0,7,7,2,3,1,3])
rEdge = np.array([[-1,0,3],[0,6,2],[0,3,0],[0,2,0],[0,1,3],[0,5,1],[1,2,2],[2,3,6],[3,4,1],[3,6,9],[4,6,7],[4,5,6],[5,6,8]])

#livingIdx = np.where(rType == 0)[0]
#idx = np.where(np.logical_and((rEdge[:, 0] != (int(livingIdx)-1)),(rEdge[:, 1] != (int(livingIdx) -1))))
#rEdge = rEdge[idx, :]
#fixed here
fp = np.array((256,256))*13

ressuld = align_fp.align_fp(boundary, rBox, rType, rEdge, fp, 18, drawResult = False)
newBox = ressuld[0]
order = ressuld[1]
rBoundary = ressuld[2]
#print(newBox)
#print(order)
#print(rBoundary)
#print(rBoundary[0].shape)
#print(updated)