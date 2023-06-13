import os
import glob
import shutil
import logging

def clear_directory(directory_path):
    print('Clearing pages folder')
    if os.path.exists(directory_path):
        files = glob.glob(directory_path + '/*')
        for f in files:
            try:
                if os.path.isfile(f):
                    os.remove(f)
                elif os.path.isdir(f):
                    shutil.rmtree(f)
            except OSError as e:
                print("Error: %s : %s" % (f, e.strerror))
                logging.error("Error: %s : %s" % (f, e.strerror))
    else:
        print(f'Error: The directory {directory_path} does not exist')
        logging.error(f'Error: The directory {directory_path} does not exist')
    
    print('Pages folder cleared')


