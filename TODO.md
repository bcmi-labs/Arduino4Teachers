Arduino4Teachers ToDo list:

 * fix portfinder: put a wrapper that controls that port already assigned to stopped containers are not picked up again when creating new containers
 * put the configuration file in a global position
 * choose what fields to provide in the general list and what field to provide in the details for each resource (class, student, environment)
 * decide if delete operations should return an error if the element to delete does not exist
 * decide if details operations should return an error if the element does not exist
 * in each update call where one or more field are updated return an error if the resource to update does not exist
 * in the "list of all students in a class" operation return an error if the class does not exist
 * in the "add a student in a class" and "DELETE delete a student from a class" operations return an error if the class does not exist
 * check the error codes (404, 500, and so on) for all the REST API calls
 * in the "list of all the environments for a student" operation return an error if the student does not exist
 * in the "create an environments for a student" and "delete an environments for a student" return an error if the student does not exist
 * in the "start/stop an environment" return an error if the environment does not exist