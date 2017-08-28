#!/bin/bash

getStackStatusCountDown=20
getInstanceStatusCountDown=20
getStackOutputCountDown=20
waitRebuildingInstanceCountDown=300
waitCreatingStackCountDown=300
waitUpdatingStackCountDown=300
waitTestingInstanceConnection=10
maxWaitTestingInstanceConnection=600

function getStackStatus(){
	stack_status=$(curl -s -X GET $2/heat/getStack/$1/status)
	count=0
	while [ "$stack_status" == "" ]
	do
		stack_status=$(curl -s -X GET $2/heat/getStack/$1/status)
		let count+=1
		if [ "$count" == "$getStackStatusCountDown" ]; then
			echo Unable to get status status.
			exit 1
		fi
	done
	echo $stack_status
}
function getInstanceStatusByName(){
	instance_status=$(curl -s -X GET $2/nova/getInstanceStatusByName/$1)
	count=0
	while [ "$instance_status" == "" ]
	do
		instance_status=$(curl -s -X GET $2/nova/getInstanceStatusByName/$1)
		let count+=1
		if [ "$count" == "$getInstanceStatusCountDown" ]; then
			echo Unable to get instance status.
			exit 1
		fi
	done
	echo $instance_status
}

function getStackOutput(){
	output_value=$(curl -s -X GET $3/heat/getStack/$1/output/$2)
	count=0
	if [ "$output_value" == "cannot find this output" ]; then
		echo Output key $2 is not exist.
		exit 1
	fi
	while [ "$output_value" == "" ]
	do
		output_value=$(curl -s -X GET $3/heat/getStack/$1/output/$2)
		if [ "$output_value" == "cannot find this output"]; then
			echo Output key $2 is not exist.
			exit 1
		fi
		let count+=1
		if [ "$count" == "$getStackOutputCountDown" ]; then
			echo Unable to get output key.
			exit 1
		fi
	done
	echo $output_value
}

function afterRebuildInstance(){
	instance_name=$1
	vm_spec_name=$2
	vm_spec_index=$3
	resource_server=$4
	echo rebuilding instance \""$vm_spec_name"_"$vm_spec_index"\"...
	instance_status=$(getInstanceStatusByName $instance_name $resource_server)
	count=0
	#wait for rebuilding instance
	while [ "$instance_status" != "ACTIVE" ]
	do
		let count+=1
		if [ "$count" == "$waitRebuildingInstanceCountDown" ]; then
			echo it takes too much time to rebuild instance \""$vm_spec_name"_"$vm_spec_index"\".
			exit 1
		fi
		sleep 10
		echo rebuilding instance \""$vm_spec_name"_"$vm_spec_index"\"...
		instance_status=$(getInstanceStatusByName $instance_name $resource_server)
	done
}

function afterCreateStack(){
	stack_name=$1
	vm_spec_name=$2
	resource_server=$3
	echo creating stack \""$vm_spec_name"\"...
	stack_status=$(getStackStatus $stack_name $resource_server)
	count=0
	#wait for creating stack
	while [ "$stack_status" != "CREATE_COMPLETE" ]
	do
		if [ "$stack_status" != "CREATE_IN_PROGRESS" ]; then
			echo $vm_spec_name is $stack_status
			exit 1
		fi
		let count+=1
		if [ "$count" == "$waitCreatingStackCountDown" ]; then
			echo it takes too much time to create stack "$vm_spec_name".
			exit 1
		fi
		sleep 10
		echo creating stack \""$vm_spec_name"\"...
		stack_status=$(getStackStatus $stack_name $resource_server)
	done
}

function rebuildInstance(){
	instance_name=$1
	vm_spec_name=$2
	vm_spec_index=$3
	resource_server=$4
	#keep looping before we make sure instance is rebuilding.
	while true :
	do
		instance_status=$(getInstanceStatusByName $instance_name $resource_server)
		echo "$vm_spec_name"_"$vm_spec_index" debug rebuild $instance_status
		if [ "$instance_status" == "ACTIVE" ]; then
			res=$(curl -s -X POST $resource_server/nova/rebuildInstanceByName/$instance_name)
			echo "$vm_spec_name"_"$vm_spec_index" debug rebuild $res
			if [ "$res" == "" ]; then
				:
			elif [ "$res" == "success" ]; then
				afterRebuildInstance $instance_name $vm_spec_name $vm_spec_index $resource_server
				break
			else 
				echo Unable to rebuild "$vm_spec_name"_"$vm_spec_index" because of $res
				exit 1
			fi
		elif [ "$instance_status" == "REBUILD" ]; then
			afterRebuildInstance $instance_name $resource_server
			break
		elif [ "$instance_status" == "can not find instance" ]; then
			break
		else
			echo $instance_name is $instance_status
			exit 1 
		fi
	done
}
function afterUpdateStack {
	stack_name=$1
	last_instance_name_list=$2
	vm_spec_name=$3
	resource_server=$4
	echo updating stack \""$vm_spec_name"\"...
	stack_status=$(getStackStatus $stack_name $resource_server)
	count=0
	#check updating is over
	while [ "$stack_status" != "UPDATE_COMPLETE" ]
	do
		let count+=1
		if [ "$count" == "$waitUpdatingStackCountDown" ]; then
			echo [Error] Deploy: it takes too much time to update stack \"$stack_name\".
			exit 1
		fi
		sleep 10
		echo updating stack \""$vm_spec_name"\"...
		stack_status=$(getStackStatus $stack_name $resource_server)
	done
	current_instance_name_list=$(getStackOutput $stack_name server_name $resource_server)
	current_instance_length=$(echo $current_instance_name_list | jq -r '. | length')
	last_instance_length=$(echo $last_instance_name_list | jq -r '. | length')
	#rebuild all the instances which is existed before updating
	for (( i=0; i<$current_instance_length; i++ ))
	do
		eval rebuildpid"$(($i+1))"\=0
		current_instance_name=$(echo $current_instance_name_list | jq -r --arg i $i '.[$i | tonumber]')
		for (( j=0; j<$last_instance_length; j++ ))
		do
			last_instance_name=$(echo $last_instance_name_list | jq -r --arg j $j '.[$j | tonumber]')
			if [ "$current_instance_name" == "$last_instance_name" ];then
				rebuildInstance $instance_name $vm_spec_name $(($i+1)) $resource_server &
				eval rebuildpid"$(($i+1))"\=\$\!
				break
			fi
		done
	done
	for (( i=1; i<=$current_instance_length; i++ ))
	do
		eval "pid=\$rebuildpid$i"
		if [ "$pid" != "0" ]; then
			wait $pid
			exit_code=$?
			if [ "$exit_code" != "0" ]; then
				exit $exit_code
			fi
		fi
	done
}
function deployStack {
	stack_name=$1
	vm_spec_name=$2
	prefer_instance_amount=$3
	resource_server=$4
	#keep looping after doing something such as updating stack or creating stack or rebuild instances
	while true :
	do
		stack_status=$(getStackStatus $stack_name $resource_server)
		echo $vm_spec_name debug $stack_status
		if [ "$stack_status" == "CREATE_COMPLETE" ] || [ "$stack_status" == "UPDATE_COMPLETE" ]; then
			#it means stack is created before, so we should make sure instances is running,
			current_instance_name_list=$(getStackOutput $stack_name server_name $resource_server)
			current_instance_length=$(echo $current_instance_name_list | jq -r '. | length')
			instance_went_wrong=false
			for (( i=0; i<$current_instance_length; i++ ))
			do
				instance_name=$(echo $current_instance_name_list | jq -r --arg i $i '.[$i | tonumber]')
				instance_status=$(getInstanceStatusByName $instance_name $resource_server)
				if [ "$instance_status" != "ACTIVE" ]; then
					echo "$vm_spec_name"_"$(($i+1))" is $instance_status
					instance_went_wrong=true
					break
				fi
			done
			if [ "$instance_went_wrong" == true ]; then
				#if instances make mistake, we will delete stack and create stack after deleting
				res=$(curl -s -X GET $resource_server/heat/deleteStack/$stack_name)
				if [ "$res" == "success" ]; then
					:
				elif [ "$res" == "" ]; then
					:
				else
					echo Unable to delete stack because of $res
					exit 1
				fi
			else
				if [ "$current_instance_length" == "$prefer_instance_amount" ]; then
					#if instances is running and instance_amount is not changed, we need to only rebuild all the instances
					for (( i=0; i<$current_instance_length; i++ ))
					do
						instance_name=$(echo $current_instance_name_list | jq -r --arg i $i '.[$i | tonumber]')
						rebuildInstance $instance_name $vm_spec_name $(($i+1)) $resource_server &
						eval rebuildpid"$(($i+1))"\=\$\!
					done
					for (( i=1; i<=$current_instance_length; i++ ))
					do
						eval "wait \$rebuildpid$i"
						exit_code=$?
						if [ "$exit_code" != "0" ]; then
							exit $exit_code
						fi
					done
					break
				else
					#if instances is running and instance_amount is changed, we need to update stack and rebuild all the original instances
					res=$(curl -s -X GET $resource_server/heat/updateStack/$stack_name/$prefer_instance_amount)
					if [ "$res" == "update success" ]; then
						afterUpdateStack $stack_name $current_instance_name_list $vm_spec_name  $resource_server
						break
					elif [ "$res" == "" ]; then
						:
					else
						echo Unable to update stack \"$stack_name\" because stack is $res
					fi
				fi
			fi
		elif [ "$stack_status" == "DELETE_IN_PROGRESS" ]; then
			#if stack is being deleted, we should wait for completion
			echo deleting stack \""$vm_spec_name"\"...
			sleep 10
		elif [ "$stack_status" == "DELETE_COMPLETE" ]; then
			#After stack is deleted, stack will exist for a short time, 
			#so we should need to wait for disappearing.
			sleep 5
		elif [ "$stack_status" == "404 Not Found" ];then
			#if stack is not exist, we just need to create stack.
			res=$(curl -s -X GET $4/heat/createStack/$1/$3/$2)
			if [ "$res" == "" ]; then
				:
			elif [ "$res" == "create success" ]; then
				afterCreateStack $stack_name $vm_spec_name $resource_server
				break
			else
				echo create stack \""$vm_spec_name"\" is not success because of $res
				exit 1
			fi
		elif [ "$stack_status" == "CREATE_IN_PROGRESS" ]; then
			#if stack is being created, it means that we activate the creation and doesn't receive success message
			#Therefore, we just need to wait for creating
			afterCreateStack $stack_name $vm_spec_name $resource_server
		elif [ "$stack_status" == "CREATE_FAILED" ] || [ "$stack_status" == "DELETE_FAILED" ]; then
			res=$(curl -s -X GET $resource_server/heat/deleteStack/$stack_name)
			if [ "$res" == "success" ]; then
				:
			elif [ "$res" == "" ]; then
				:
			else
				echo Unable to delete stack because of $res
				exit 1
			fi
		else
			echo stack is $stack_status
			exit 1
		fi
	done
}
function checkDeployCfg {
	#check if it is a valid json file
	checkvalid=$(cat $1 | jq '.')
	if [ "$checkvalid" == "" ]; then
		echo "[Error] Deploy: $1 is not a valid json file"
		exit 1
	fi
	#check if it has property "vm_spec"
	checkvalid=$(cat $1 | jq 'has("vm_spec")')
	if [ "$checkvalid" == "false" ]; then
		echo "[Error] Deploy: vm_spec should be defined"
		exit 1
	fi
	instance_items_len=$(cat $1 | jq '.["vm_spec"] | length')
	deploy_step_len=$(cat $1 | jq '.["deploy_step"] | length')
	declare -A exist_vm_spec
	for (( i=0; i<$instance_items_len; i++ ))
	do
		vm_spec_name=$(cat $1 | jq -r --arg i $i '.["vm_spec"][$i | tonumber]["vm_spec_name"]')
		instance_amount=$(cat $1 | jq -r --arg i $i '.["vm_spec"][$i | tonumber]["instance_amount"]')
		#check vm_spec_name is in the correct format
		if [ "$(echo $vm_spec_name|sed 's/[0-9A-Za-z_]//g')" != "" ]; then
			echo "[Error] Deploy: vm_spec_name allows only digits, a-z, A-Z and '_'."
			exit 1
		fi
		#check vm_spec_name is not empty and is not repeated
		if [ "$(echo $vm_spec_name)" == "" ]; then
			echo "[Error] Deploy: vm_spec_name cannot be empty."
			exit 1
		elif [ "${exist_vm_spec[$vm_spec_name]}" == "exist" ]; then
			echo "[Error] Deploy: vm_spec_name '$vm_spec_name' cannot be repeated."
			exit 1
		else
			exist_vm_spec["$vm_spec_name"]=exist
		fi
		#check instance_amount is not empty
		if [ "$(echo $instance_amount)" == "" ]; then
			echo "[Error] Deploy: instance_amount of vm_spec '$vm_spec_name' cannot be empty."
			exit 1
		fi
		#check instance amount is an integer
		if [ "$(echo $instance_amount|sed 's/[0-9]//g')" != "" ]; then
			echo "[Error] Deploy: instance_amount of vm_spec '$vm_spec_name' needs to be an integer."
			exit 1
		fi
		#check instance_amount is not zero
		if [ "$(echo $instance_amount)" == "0" ]; then
			echo "[Error] Deploy: instance_amount of vm_spec '$vm_spec_name' cannot be zero."
			exit 1
		fi
	done
	for (( i=0; i<$deploy_step_len; i++ ))
	do
		target_vm_spec=$(cat "$deployCfg" | jq -r --arg i $i '.["deploy_step"][$i | tonumber]["vm_spec_name"]')
		script=$(cat "$deployCfg" | jq -r --arg i $i '.["deploy_step"][$i | tonumber]["script"]')
		#check vm_spec_name which deploy_step appoints is defined above. 
		if [ "${exist_vm_spec[$target_vm_spec]}" == "" ]; then
			echo "[Error] Deploy: vm_spec_name of deploy_step '$target_vm_spec' did not match any vm_spec defined before."
			exit 1
		fi
		#check deploy_step appointed script file is exist
		if [ ! -f $script ]; then
			echo "[Error] Deploy: script of deploy_step '$script' does not exist!"
			exit 1
		fi
	done
}

jobName="$1"
deployCfg="$2"
resource_server="$3"
projID="$4"

echo "jobName=$jobName"
echo "deployCfg=$deployCfg"
echo "resource_server=$resource_server"
echo "projID=$projID"

if [ ! -f "$deployCfg" ]; then
	echo "[Error] Deploy: File $deployCfg does not exist!"
	exit 1
elif [[ "$deployCfg" = /* ]]; then
	echo "[Error] Deploy: $deployCfg is not a relative path!"
	exit 1
fi

#check deploy file is in correct format
checkDeployCfg "$deployCfg"
echo '------------------Deploy Stacks-------------------'
#create stack per vm_spec
instance_items_len=$(cat "$deployCfg" | jq '.["vm_spec"] | length')
deploy_step_len=$(cat "$deployCfg" | jq '.["deploy_step"] | length')
for (( i=0; i<$instance_items_len; i++ ))
do
	instance_amount=$(cat "$deployCfg" | jq --arg i $i '.["vm_spec"][$i | tonumber]["instance_amount"]')
	vm_spec_name=$(cat "$deployCfg" | jq -r --arg i $i '.["vm_spec"][$i  | tonumber]["vm_spec_name"]')
	stack_name="TaaS"_"$projID"_"$vm_spec_name"
	deployStack $stack_name $vm_spec_name $instance_amount $resource_server &
	eval pid"$(($i+1))"\=\$\!
done
for (( i=1; i<=$instance_items_len; i++ ))
do
	eval "wait \$pid$i"
	exit_code=$?
	if [ "$exit_code" != "0" ]; then
		exit $exit_code
	fi
done
echo '------------------Environment Variables--------------------'
#write instances information into env.properties and echo them 
for (( i=0; i<$instance_items_len; i++ ))
do
	instance_amount=$(cat "$deployCfg" | jq -r --arg i $i '.["vm_spec"][$i | tonumber]["instance_amount"]')
	vm_spec_name=$(cat "$deployCfg" | jq -r --arg i $i '.["vm_spec"][$i | tonumber]["vm_spec_name"]')
	stack_name=TaaS_"$projID"_"$vm_spec_name"
	floating_ip_list=$(getStackOutput $stack_name floating_ip $resource_server)
	private_ip_list=$(getStackOutput $stack_name private_ip $resource_server)
	for (( j=0; j<$instance_amount; j++ ))
	do
		eval export TaaS_"$vm_spec_name"_"$(($j+1))"_PublicIP=$(echo $floating_ip_list | jq -r --arg j $j '.[$j | tonumber]')
		eval export TaaS_"$vm_spec_name"_"$(($j+1))"_PrivateIP=$(echo $private_ip_list | jq -r --arg j $j '.[$j | tonumber]')
		eval echo TaaS_"$vm_spec_name"_"$(($j+1))"_PublicIP=\$TaaS_"$vm_spec_name"_"$(($j+1))"_PublicIP >> "env.properties"
		eval echo export TaaS_"$vm_spec_name"_"$(($j+1))"_PublicIP >> "env.properties"
		eval echo TaaS_"$vm_spec_name"_"$(($j+1))"_PrivateIP=\$TaaS_"$vm_spec_name"_"$(($j+1))"_PrivateIP >> "env.properties"
		eval echo export TaaS_"$vm_spec_name"_"$(($j+1))"_PrivateIP >> "env.properties"
		eval echo TaaS_"$vm_spec_name"_"$(($j+1))"_PublicIP=\$TaaS_"$vm_spec_name"_"$(($j+1))"_PublicIP
		eval echo TaaS_"$vm_spec_name"_"$(($j+1))"_PrivateIP=\$TaaS_"$vm_spec_name"_"$(($j+1))"_PrivateIP
	done
done

export private_key=~/bin/deploy/ssh_key/sit_taas_heat.pem

echo '------------------Testing Connection---------------'
for (( i=0; i<$instance_items_len; i++ ))
do
	instance_amount=$(cat "$deployCfg" | jq --arg i $i '.["vm_spec"][$i | tonumber]["instance_amount"]')
	vm_spec_name=$(cat "$deployCfg" | jq -r --arg i $i '.["vm_spec"][$i | tonumber]["vm_spec_name"]')
	for (( j=1; j<=$instance_amount; j++ ))
	do
		stack_name="TaaS"_"$projID"_"$vm_spec_name"_"$j"
		eval sudo ssh-keygen -R \$TaaS_"$vm_spec_name"_"$j"_PublicIP
		echo $private_key
		waitTime=0
		while [ ! "$(eval sudo ssh -o StrictHostKeyChecking=no -i $private_key ubuntu@\$TaaS_"$vm_spec_name"_"$j"_PublicIP 'echo Test')" ]
		do
			if [ $waitTime -ge $maxWaitTestingInstanceConnection ]; then
				echo "[Error] Instance connection checking timeout"
				exit 1
			fi
			echo Connecting to Instance.................
			let waitTime+=$waitTestingInstanceConnection
			sleep $waitTestingInstanceConnection
		done
	done
done
echo '------------------Execute Script--------------------'
for (( i=0; i<$deploy_step_len; i++ ))
do
	target_name=$(cat "$deployCfg" | jq -r --arg i $i '.["deploy_step"][$i | tonumber]["vm_spec_name"]')
	script=$(cat "$deployCfg" | jq -r --arg i $i '.["deploy_step"][$i | tonumber]["script"]')
	async=$(cat "$deployCfg" | jq -r --arg i $i '.["deploy_step"][$i | tonumber]["async"]')
	for (( j=0; j<$instance_items_len; j++ ))
	do
		vm_spec_name=$(cat "$deployCfg" | jq -r --arg j $j '.["vm_spec"][$j | tonumber]["vm_spec_name"]')
		if [ "$target_name" == "$vm_spec_name" ]; then
			instance_amount=$(cat "$deployCfg" | jq --arg j $j '.["vm_spec"][$j | tonumber]["instance_amount"]')
			for (( k=1; k<=$instance_amount; k++))
			do
				eval export public_ip=\$TaaS_"$vm_spec_name"_"$k"_PublicIP
				eval export private_ip=\$TaaS_"$vm_spec_name"_"$k"_PrivateIP
				build_step_pids=""
				if [ "$async" == "true" ]; then
					bash ./$script &
					# store PID of process
					build_step_pids+=" $!"
				else
					bash ./$script
					exit_code=$?
					if [ $exit_code -ne 0 ]; then
						echo "[Error] Running $script for ${vm_spec_name}_$k failed"
						exit $exit_code
					fi
				fi
			done
			if [ "$async" == "true" ]; then
				# wait for all processes to finish and check the exit codes
				k=0
				for p in $build_step_pids; do
					let k+=1
					wait $p
					exit_code=$?
					if [ $exit_code -ne 0 ]; then
						echo "[Error] Running $script for ${vm_spec_name}_$k failed"
						exit $exit_code
					fi
				done
			fi
		fi
	done
done
