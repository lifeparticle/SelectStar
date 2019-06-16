# SelectStar

This script will help you to create an html repo report based on stars and other parameters.
You'll need to give the python script a link that has the list of repo links.
I'm using the following link to get all the repo links.

https://github.com/wbkd/awesome-d3

After you've successfully run the python script, it will create a data file, separated by space.
You can use this data file to generate your repo report by using repo_report.html by selecting the data file.

![Screen Shot 2019-06-16 at 7 11 13 pm](https://user-images.githubusercontent.com/1612112/59562028-a4f58e00-906a-11e9-881e-4df13b415ef9.png)

The report
![Screen Shot 2019-06-16 at 7 11 38 pm](https://user-images.githubusercontent.com/1612112/59562031-aaeb6f00-906a-11e9-93ad-4e01387aa559.png)


## Prerequisite

```
easy_install pip
sudo pip install requests
sudo pip install beautifulsoup4
```

## Run

```
python repo_report.py
```

## Further readings
https://api.github.com/rate_limit

https://pythex.org/

https://developer.github.com/v3/auth/#basic-authentication

https://datatables.net/manual/installation


## Bug Reports and Feature Requests
Please create an issue with as much information you can. Thank you.

## Author
Mahbub Zaman (https://mahbub.ninja)

## License
MIT License
