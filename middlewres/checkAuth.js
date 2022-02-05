function checkAuth(req,res,next){
    if(req.session.is_logged_in&& req.session.user.isVarified)
    {
        next();
        return ;
    }
    else if( req.session.is_logged_in && !req.session.user.isVarified )
  {
    res.render("notVarified");
    return;
  }
    res.redirect("/logIn");
}
module.exports=checkAuth;