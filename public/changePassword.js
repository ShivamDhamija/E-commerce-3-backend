let password1=document.getElementById("password1");
let password2=document.getElementById("password2");
let pwmatch=document.getElementById("pwmatch");
let submitButton=document.getElementById("submitButton");
let allowed=document.getElementById("allowed");

password2.addEventListener("keyup",function(){
    if(password2.value===password1.value&&password2!="")
    {
        pwmatch.innerText="Passwords match";
        pwmatch.style.color="mediumaquamarine";
    }
    else
    {
        pwmatch.innerText="Passwords don’t match";
        pwmatch.style.color="#CE0404";
    }
    
})

submitButton.addEventListener("click",function(){
 
    if(password2.value!=password1.value&&password2!="")
    {
        allowed.style.display="block";
        return;
    }
    let no=false,up=false,lo=false,ch=false
    let len=password2.value.length
    if(len>=8)
    ch=true;
    for( i=0;i<len;i++)
    {
        if(password2.value[i]>='a'&&password2.value[i]<='z')
        lo=true;
        if(password2.value[i]>='A'&&password2.value[i]<='Z')
        up=true;
        if(password2.value[i]>=0&&password2.value[i]<=9)
        no=true;
    }
    if(no&&lo&&up&&ch)
    {
        allowed.style.display="none";
  
        var request = new XMLHttpRequest();
    
        request.open("POST","/changePassword");
        request.setRequestHeader("Content-Type", "application/json");
       request.send(JSON.stringify({ newPass:password1.value}));
       request.addEventListener("load",function(){
           if(request.status===200)
           window.location="http://localhost:3000/logIn"
       })
    }
    else
    allowed.style.display="block";


})