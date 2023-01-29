CREATE DATABASE calorieDB;
USE calorieDB;
CREATE TABLE food (FoodName varchar(255), TypeVal integer(255), Unit varchar(255), Carbs integer(255), Fat integer(255), Protein integer(255), Salt integer(255), Sugar integer(255));
INSERT INTO food (FoodName, TypeVal, Unit, Carbs, Fat, Protein, Salt, Sugar)VALUES ('flour', 100, 'gram', 81, 1.4, 9.1, 0.01, 0.6);
CREATE USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Lethalzephyr23!';
GRANT ALL PRIVILEGES ON myBookshop.* TO 'root'@'localhost';