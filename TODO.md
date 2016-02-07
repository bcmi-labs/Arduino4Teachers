# Arduino4Teachers ToDo list

## REST APIs

 * implement paging in lists
 * store passwords in an encripted way
 * put the configuration file in a global position
 * check the error codes (404, 500, and so on) for all the REST API calls (class, student, environment)
 * implement authentication for all the operations (the teacher should be able to perform all the operations while students should be able to perform operations only on their environments)
 * insert information about types in the README file
 * ~~in the "list of all students in a class" operation return an error if the class does not exist~~
 * ~~when a student is deleted, she should be removed from her classes and her environments should be removed~~
 * ~~fix portfinder: put a wrapper that controls that port already assigned to stopped containers are not picked up again when creating new containers~~
 * ~~in the "add a student in a class" and "DELETE delete a student from a class" operations return an error if the class does not exist or the student does not exists~~
 * ~~in the "list of all the environments for a student" operation return an error if the student does not exist~~
 * ~~choose what fields to provide in the general list and what field to provide in the details for each resource (class, student, environment)~~
 * ~~delete operations should return an error if the element to delete does not exist (class, student, environment)~~
 * ~~get details operations should return an error if the element does not exist (class, student, environment)~~
 * ~~in each update call where one or more field are updated return an error if the resource to update does not exist (class, student, environment)~~
 * ~~in the "create an environments for a student" and "delete an environments for a student" return an error if the student does not exist~~
 * ~~in the "start/stop an environment" return an error if the environment does not exist~~
 * ~~check and correct the return types for all the REST APIs (class, student, environment)~~