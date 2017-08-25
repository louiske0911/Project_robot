
var exec = require('child_process').exec;
var logging = require('../../lib/logging');
logger2 = logging.log_routes('Openstack'); // Set up Category
logger2.setLevel('all'); //set logger level


/**
 *   Remove the stack on the OpenStack Heat
 */ 
 module.exports = {
         removeStack: function(jobname) {
         var cmd_AIO = "sshpass -p '1111' ssh -o 'StrictHostKeyChecking no' ccma@10.206.13.3 -l ccma " + '"source ITP4_Heat_InstanceGroup-openrc && heat stack-delete ' + jobname + '"';
         logger2.debug('cmd ==========' + cmd_AIO)
         var cmd_HA = "sshpass -p '1111' ssh -o 'StrictHostKeyChecking no' ccma@10.213.9.1 -l ccma " + '"source ITP4_Heat_Instance_HA-openrc.sh && heat stack-delete ' + jobname + '"';
         logger2.debug('cmd ==========' + cmd_HA)
         exec(cmd_HA, function(err, stdout, stderr) {
                 if (err) {
                     exec(cmd_AIO, function(err, stdout, stderr) {
                             if (err) {
                                 logger2.debug('ATO__err-------' + err);
                                 logger2.debug('AIO__errstdout-------' + stdout);
                                 logger2.debug('AIO__errstderr-------' + stderr);
                                 return false;
                             } else {
                                 logger2.debug('Success to delete the stack on the AIO platform');
                                 return true;
                             }

                         });
                     
                         logger2.debug('HA__err-------' + err); 
                         logger2.debug('HA__errstdout-------' + stdout); 
                         logger2.debug('HA__errstderr-------' + stderr);
                         return false;

                     }
                     else {
                         logger2.debug('Success to delete the stack on the HA platform');

                         return true;

                     }

                 });

         }

         }

