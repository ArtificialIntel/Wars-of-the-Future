function initiate()
{
    var form = document.getElementById("selectionForm");
    var message="Here:\n";
    form.action = "index.html";
    var mUnit = 0;
    var dUnit = 0;
    var sUnit = 0;
    for (var i = 0; i < form.moveableUnit.length; i++){
      if (form.moveableUnit[i].checked){
         message = message + "\n"+i+": " + form.moveableUnit[i].value;
         mUnit = i;
      }
   }
   for (var i = 0; i < form.dynamicUnit.length; i++){
      if (form.dynamicUnit[i].checked){
         message = message + "\n" +i+": " + form.dynamicUnit[i].value;
         dUnit = i;

      }
   }
   for (var i = 0; i < form.staticUnit.length; i++){
      if (form.staticUnit[i].checked){
         message = message + "\n" +i+": " + form.staticUnit[i].value;
	     sUnit = i;

      }
   }
}

window.onload = initiate;