# Arduino4Teachers
Arduino4Teacher is an educational tool for teaching Arduino in a classroom. It allows teachers and students to easily collaborate in developing software targeting Arduino boards by using Arduino IDE. An intuitive control panel allows the teacher to create isolated, self-contained, Web accessible development environment for each student. Thus, students can interact with Arduino IDE and program one or more Arduino boards through a simple Web browser. The teacher can interact with the students through co-browsing functionalities observing what students do and directly act when necessary. 

## Architecture and technologies
Arduino4Teachers provides a customized Ubuntu-based live distribution that can be stored in a USB flash drive. The distribution is equipped with a full installation of Docker and with a working Node.js environment. When the distribution is booted, a Node.js-based Web application is started providing the teacher with a control panel for managing classrooms, students, and development environments and students with an interface to access their development environments. These are implemented through Docker containers and OS.js instances. Together.js library is exploited to implement co-browsing functionalities.

## Features
Teacher control panel functionalities: 

* add/remove a class
* add/remove a student
* add/remove a development environment for a student
* add/remove association between a development environment and a board

Student access panel:

* login/logout functionalities
* list of the development environments associated with the student
* redirect to the OS.js instance

## REST API

### Authentication 

|Method    |URL                                           |Semantics                        |Parameters                            |Return Type                |
|----------|----------------------------------------------|---------------------------------|--------------------------------------|---------------------------|
| `POST`   | /login                                       | authenticate to the sytem       | username (body), password (body)     | -                         | 
| `GET`    | /logout                                      | destroy the session             | -                                    | -                         |


### Classes

|Method    |URL                                           |Semantics                        |Parameters                            |Return Type         |
|----------|----------------------------------------------|---------------------------------|--------------------------------------|--------------------|
| `GET`    | /classes                                     | list of all classes             | -                                    | array of class     | 
| `GET`    | /classes/(class_uuid)                        | details about a class           | class_uuid (url)                     | class              |
| `POST`   | /classes                                     | create a class                  | class (body)                         | class              | 
| `DELETE` | /classes/(class_uuid)                        | remove a class                  | class_uuid (url)                     | -                  | 
| `PUT`    | /classes/(class_uuid)                        | change class information        | class_uuid (url), class (body)       | class              |
| `GET`    | /classes/(class_uuid/students                | list of all students in a class | class_uuid (url)                     | array of student   |
| `PUT`    | /classes/(class_uuid/students                | add a student in a class        | class_uuid (url), student (body)     | class              | 
| `DELETE` | /classes/(class_uuid/students/(student_uuid) | remove a student from a class   | class_uuid (url), student_uuid (url) | class              |   

### Students

|Method    |URL                                           |Semantics                        |Parameters                            |Return Type         |
|----------|----------------------------------------------|---------------------------------|--------------------------------------|--------------------|
| `GET`    | /students                                    | list of all students            | -                                    | array of student   | 
| `GET`    | /students/(student_uuid)                     | details about a student         | student_uuid (url)                   | student            |
| `POST`   | /students                                    | create a student                | student (body)                       | student            | 
| `DELETE` | /students/(student_uuid)                     | remove a student                | student_uuid (url)                   | -                  | 
| `PUT`    | /students/(student_uuid)                     | change student information      | student_uuid (url), student (body)   | student            |

### Environments

|Method    |URL                                                      |Semantics                                 |Parameters                                  |Return Type           |
|----------|---------------------------------------------------------|------------------------------------------|--------------------------------------------|----------------------|
| `GET`    | /environments                                           | list of all environments                 | -                                          | array of environment | 
| `GET`    | /environments/(environment_uuid)                        | details about an environments            | environment_uuid (url)                     | environment          |
| `POST`   | /environments                                           | create an environment                    | environment (body)                         | environment          | 
| `DELETE` | /environments/(environment_uuid)                        | remove an environment                    | environment_uuid (url)                     | -                    | 
| `PUT`    | /environments/(environment_uuid)/status/{start or stop} | start/stop and environment               | environment_uuid (url)                     | environment          | 
| `PUT`    | /environments/(environment_uuid)                        | change environment information           | environment_uuid (url), environment (body) | student              |
| `GET`    | /environments/owner/(student_uuid)                      | list of all the environment for a student| student_uuid (url)                         | array of environment | 


