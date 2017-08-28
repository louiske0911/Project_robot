
$(document).ready(function(){
//    let checkboxAuthod1, checkboxAuthod2, checkboxAuthod3;
//    sharedUserId();
    $("#updateTable").click(function(){
     //   alert($("#shareName").val());
    let sharedUserId =$("#shareName").val();
    console.log("sharedUserId")
    sharedUserId ={
         sharedUserId:$("#shareName").val(),
         checkboxId1 :"projTest1",
         checkboxId2 :"projTest2",
         checkboxId3 :"projTest3"
    };
//    let object = new updateProject


//
        alert($("#shareName").val());

        let td = '<td>'+sharedUserId.sharedUserId +'</td>';
        td += '<td>'+'<input type="checkbox" id ="'+sharedUserId.checkboxId1+'" name ="projTest1" > 456 '+'</td>';
        td += '<td>'+'<input type="checkbox" id ="'+sharedUserId.checkboxId2+'" name ="projTest1" > 789 '+'</td>';
        td += '<td>'+'<input type="checkbox" id ="'+sharedUserId.checkboxId3+'" name ="projTest1" > 111 '+'</td>';
        let p = '<p>'+td+'</p>'
        let tr='<tr class="dateTable" >'+p+'</tr>'
        $(".test").append(tr);

    });
});

//
//
//function updateProject(String sharedUserId) {
//
//    let objectId ={
//         sharedUserId:"sharedUserId",
//         checkboxId1 :"projTest1",
//         checkboxId2 :"projTest2",
//         checkboxId3 :"projTest3"
//    };
//}

