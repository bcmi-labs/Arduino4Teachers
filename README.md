# Arduino4Teachers
Arduino4Teacher is an educational tool for teaching Arduino in a classroom. It allows teachers and students to easily collaborate in developing software targeting Arduino boards by using Arduino IDE. An intuitive control panel allows the teacher to create isolated, self-contained, Web accessible development environment for each student. Thus, students can interact with Arduino IDE and program one or more Arduino boards through a simple Web browser. The teacher can interact with the students through co-browsing functionalities observing what students do and directly act when necessary. 

## Architecture and technologies
Arduino4Teachers provides a customized Ubuntu-based live distribution that can be stored in a USB flash drive. The distribution is equipped with a full installation of Docker and with a working Node.js environment. When the distribution is booted, a Node.js-based application is started providing a REST interface for managing classrooms, students, and development environments. An Apache Web server hosts a PHP-based Web interface that acts as a client for the Node.js application and provides the teacher control panel. Development environments are implemented through Docker containers and OS.js instances. Together.js library is exploited to implement co-browsing functionalities.

## Features
Teacher control panel functionalities: 

* add/remove a student
* add/remove a development environment for a student
* add/remove association between a development environment and a board

Student access panel:

* login/logout functionalities
* list of the development environments associated with the student
* redirect to the OS.js instance 