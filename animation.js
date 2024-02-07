document.addEventListener('DOMContentLoaded', function() {

    var tl=gsap.timeline({
        defaults:{
            opacity:0,
            duration:0.8,
            ease:"linear",
        }
    });

    tl.fromTo(".fa-key",{y:-50}, {
        y:0,
        opacity:1,
    })

    tl.fromTo(".main-title",{x:-50}, {
        x:0,
        opacity:1,
    })

    tl.fromTo(".lead",{x:50}, {
        x:0,
        opacity:1,
    })

    tl.fromTo(".buttons",{y:20}, {
        y:0,
        opacity:1,
    })

    gsap.set(".register-page",{
        opacity:0,
    })

    gsap.to(".register-page",{
        opacity:1,
        duration:3,
    })

    gsap.set(".login-page",{
        opacity:0,
    })

    gsap.to(".login-page",{
        opacity:1,
        duration:3,
    })

    gsap.set(".secrets-page",{
        opacity:0,
    })

    gsap.to(".secrets-page",{
        opacity:1,
        duration:3,
    })

});
