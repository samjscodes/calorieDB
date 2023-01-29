# Recipe Buddy Dynamic Web Application
## About
This web application is a digital nutrient monitor called Recipe Buddy and it displays nutritional facts for recipes or meals based on food that has been entered. 

## Requirements
You may need to install the following before running this web application as well as create a database:
Bcrypt: ```npm install bcrypt```

Express session: ```npm install express-session```

Validator : ```npm install express-validator```

Sanitizer: ```npm install express-sanitizer```

Request module: ```npm install request```

MySQL: ```npm install mysql```

Please note that additional packages/modules may be required in addition to those listed.

## What the web app contains:

### Home page (available to everyone)

### About page (available to everyone):
1) Displays information about the web application

### Register page (available to everyone): 
1) Collects form data to be passed to the back-end (database) and store user data in the USERS table in calorieDB
2)	User can use this page to create an account
3)	Please make sure the form is field with the instructions given below:

      a.	Do not leave any fields blank or it will redirect you to the register page again and not register you or save data in the database.
      
      b.	“Username” must have at least 3 characters
      
      c.	First name and last name both should have at least 1 character each
      
      d.	Email should be in email format (e.g email@gmail.com, email@yahoo.com...)
      
      e.	Password should have at least 8 characters

### Login page:
1) Collects form data to be checked against data stored in USERS table.
2) If the username does not exist the password input is wrong, it will display a message for both cases. 
    
### Logout- to log out. 

###	Add food page (only available to logged-in users):
1) It displays a form to add food 
2) The form should be fully filled and at least 1 character in each field. The field type for all of them is Integer except Food Name and unit.  The unit field has a drop down to select the appropriate measurement.
3) The database will also store userID

### List food (available to all users)
1) Displays food data in a tabular format
2) Select the food (checkbox) and enter the number next to the field and click calculate to see the total number. 

### Search food page (available to everyone)

###	Update food page (only available to logged-in users)
1) User can search for a food and update it, only the user who has added the food will be able to update it.

###	Delete food page- For deleting a food item 
1) Users can only delete their own food items


###	API The navigation bar contains “Food Api” which shows the list of food in JSON format. The user can search for food by following in the instructions in main.js. 
1) POST, PUT and DELETE have also been implemented.

