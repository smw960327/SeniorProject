create database if not exists web_ccompile default character set utf8 default collate utf8_general_ci;

create database if not exists typeorm_learn default character set utf8 default collate utf8_general_ci;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'meng0413';

flush privileges;

show databases;

use web_ccompile;

drop database  web_ccompile;

show tables;