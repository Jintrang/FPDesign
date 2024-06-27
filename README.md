# 1. Interface
### Installation
This implementation requires the following dependencies (tested on Window 11):

* Conda

* Python 3.9

Create a new environment for running.

  ```bash
  conda create -n g2p_app python=3.9 
  conda activate g2p_app
	```

* You can quickly install/update these dependencies by running the following:

  ```bash
  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu117 -U
  pip install django opencv-python scipy pandas shapely -U
  ``` 
		
* Matlab Python API (Matlab 2024b+ for python 3.9): Matlab is required to align room bounding boxes with the floorplan boundary.
  B1: Access https://matlab.mathworks.com/ 
  B2: "30-day MATLAB trial" -> get a trial -> step by step to get trial and dowload matlab
  B3: Open MATLAB and login
  B4: Find the file "setup.py" in `<PATH_TO_MATLAB>/<VERSION>/extern/engines/python/` and run
  
  ```
  python setup.py install
	```


###  Run

* Process Data: 
  B1: Download processed RPLAN from https://github.com/HanHan55/Graph2plan/releases/download/data/Data.zip
	B2: Unzip the data to this repository
	B3: Place the unzipped data in a folder with the same file name as the project code.
  Note: The upload boundary in the interface is under the folder Interface\static\Data\Img\
* Run project:

  ```bash
  python manage.py runserver 0.0.0.0:8000
  ```
		
* Open browser: http://127.0.0.1:8000/home
			
	

# 2. Network & Post Processing
## 2.1. Network
### Requirements

Create a new environment for training.

  ```bash
  conda create -n g2p_train python=3.9
  conda activate g2p_train
  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu117 -U
  pip install django opencv-python scipy pandas shapely tqdm tensorboardX pytorch-ignite==0.2.1 -U
  ```

### Prepare data

**Split data for training**

  Run the split script to get train/valid/test split of the data in `Network/data`

  ```bash
  python split.py
  ```

### Train

  Run the trainning script and the experiment logs and outputs are saved in `experiment` (created automatically).

  ```bash
  # train + valid
  python train.py
  # testing evaluation
  python train.py --skip_train 1 
  ```

## 2.2. Post processing & Generate without Interface
The final output of the network is a raster floorplan image and one bounding box for each room (the refined one). An issue that may occur with the output boxes is that they may not be well-aligned and some boxes may overlap in certain regions. So we need some post processing.

### Requirements
Activate g2p_app conda enviroment:
```
conda activate g2p_app
```

### Test with network training data

Change the `model_path` to the path of trained model and `dataset_path` to the test split of the dataset in `PostProcessing/test.py`, and run 

```
python test.py
```
A floorplan image `test.png` will be generated.  

### Test with boundary images

Get the data introduced in the **Interface** part (`Interface\static\Data\Img\`), and run

```
python test_interface_data.py
```
A floorplan image `test_interface_data.png` will be generated.  


