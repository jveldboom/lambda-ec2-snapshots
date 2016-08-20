var AWS = require('aws-sdk');
var ec2 = new AWS.EC2();
var deleteOn = new Date();

exports.handler = function(event, context) {

   // create snapshots --------------------------------
   var createParams = {
      Filters: [
         { Name: 'tag-key', Values: ['Backup','backup'] }
      ]
   };
   ec2.describeInstances(createParams, function(err, data) {
      if (err) console.log(err, err.stack);
      else{
         for(var r=0; r<data.Reservations.length; r++){
            for(var i=0; i<data.Reservations[r].Instances.length; i++){
               createSnapshots(data.Reservations[r].Instances[i]);
            }
         }
      }
   });

   // delete snapshots --------------------------------
   var deleteParams = {
      Filters: [
         { Name: 'tag-key', Values: ['DeleteOn'] },
         { Name: 'tag-value', Values: [formatDate(deleteOn)] },
      ]
   };
   ec2.describeSnapshots(deleteParams, function(err, data) {
      if (err) console.log(err, err.stack);
      else{
         for(var s=0; s<data.Snapshots.length; s++){
            deleteSnapshot(data.Snapshots[s].SnapshotId);
         }
      }
   });
};

function createSnapshots(instance){
   var volumes = getInstanceVolumes(instance);
   var retention = getTag(instance.Tags,'Retention');
   var date = new Date();

   for(var v=0; v<volumes.length; v++)
   {
      console.log('Creating snapshot for volumeId '+volumes[v]+' on instance name '+getTag(instance.Tags,'Name'));
      var params = {
         VolumeId: volumes[v],
         Description: getTag(instance.Tags,'Name')+' node backup',
         DryRun: false
      };
      ec2.createSnapshot(params, function(err, data) {
         if (err) console.log(err, err.stack); // an error occurred
         else{
            date.setDate(date.getDate() + parseInt(retention));
            tagSnapshot(data.SnapshotId,formatDate(date));
         }
      });
   }
}

function deleteSnapshot(snapshotId){
   var params = {SnapshotId: snapshotId};
   ec2.deleteSnapshot(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else     console.log('Deleted snapshot id '+data.Snapshots[s].SnapshotId);
   });
}

function tagSnapshot(snapshotId,deleteOn){
   var params = {
      Resources: [ snapshotId ],
      Tags: [{
         Key: 'DeleteOn',
         Value: deleteOn
      }]
   };
   ec2.createTags(params, function(err, data) {
      if (err) console.log(err, err.stack);
      else console.log('Add DeleteOn tag '+deleteOn+' to snapshot id: '+snapshotId );
   });
}

function getInstanceVolumes(instance){
   var volumes = [];
   for(var i = 0; i < instance.BlockDeviceMappings.length; i++){
      volumes.push(instance.BlockDeviceMappings[i].Ebs.VolumeId);
   }
   return volumes;
}

function getTag(tags,key){
   for(var t=0;t<tags.length;t++){
      if(tags[t].Key == key) return tags[t].Value;
   }
   return false
}

function formatDate(date){
   return date.getFullYear() + '' + ('0' + (date.getMonth()+1)).slice(-2) + '' + ('0' + date.getDate()).slice(-2);
}