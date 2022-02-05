const btns=document.querySelectorAll("#btns");


function change (detail){
    let name=document.getElementsByTagName("h5");
    let src=document.getElementsByTagName("src");
    let price=document.getElementsByTagName("h2");
    let dexcription =document.getElementsByTagName("h3");
    console.log((name[0]));
    name.innerHTML=detail.pName;
}
btns.forEach(function(btn){
    btn.addEventListener("click",function(){
  
        var request = new XMLHttpRequest();
    
        request.open("POST","/modalsData");
        request.setRequestHeader("Content-Type", "application/json");
        img=event.target.parentNode.id;
        request.send(JSON.stringify({ img:img}));
    
        request.addEventListener("load", function()
        {
            const detail=JSON.parse(request.responseText);
            //console.log(detail)
            if(request.status === 200)
            {
                let name=document.querySelector("h5");
    let src=document.querySelector("#img");
    let price=document.querySelector("#price");
    let description =document.querySelector("h3");
    name.innerText=detail.pName;
    src.setAttribute("src",img);
    price.innerText=detail.pPrice;
    description.innerText=detail.description;
            }
        });
    
    });
})

