MKModelUtils = (function start(){
    var frameContainer;
    var baseHtmlFrame;
    var styleSheet;

    var previewKeyframeIn = 'selectPreview',
        previewKeyframeOut = 'deSelectPreview',
        showFrameIn = 'showFrame',
        hideFrameOut = 'hideFrame',
        animationInterval = 1,
        modelIndex = 0,
        loading = false,
        animating = false;

    function MKModel(base64,fromWidth,fromHeight,toWidth,toHeight){
        this.base64 = base64;
        this.width = toWidth;
        this.height = toHeight;
        this.keyframeIn = previewKeyframeIn+modelIndex;
        this.keyframeOut = previewKeyframeOut+modelIndex;
        this.animationIn = function (){
            return createAnimationString(animationInterval,this.keyframeIn);
        };
        this.animationOut = function (){
            return createAnimationString(animationInterval,this.keyframeOut);
        };
        var keyframes = '';
        keyframes+=createKeyframe(this.keyframeIn,'filter:blur(0);\n','width:'+toPX(toWidth)+';\n height:'+toPX(toHeight)+';\n filter:blur(2px);\n');
        keyframes+=createKeyframe(this.keyframeOut,'filter:blur(2px);\n','width:'+toPX(fromWidth)+';\n height:'+toPX(fromHeight)+';\n filter:blur(0);\n');
        styleSheet.innerHTML += keyframes;
        modelIndex++;
    }

    function toPX(x){
        return x+'px'
    }

    function createKeyframe(name, fromStyle, toStyle){
        return '@keyframes '+name+'{ \n'+
            'from { ' + fromStyle + ' }\n'+
            'to { ' + toStyle + ' }'+
            '}\n';
    };

    function createAnimationString(duration,keyframeName){
        return duration + 's ' +keyframeName + ' forwards';
    }

    /*function animationIn(){
        return createAnimationString(animationInterval,previewKeyframeIn);
    }

    function animationOut(){
        return createAnimationString(animationInterval,previewKeyframeOut);
    }*/

    function animationShow(){
        return createAnimationString(animationInterval,showFrameIn);
    }

    function animationHide(){
        return createAnimationString(animationInterval,hideFrameOut);
    }

    return {
            initFrames: function(frameContainerId,frameId){
                frameContainer = document.getElementById(frameContainerId);
                baseHtmlFrame = document.getElementById(frameId);
                if (arguments.length == 3) {
                    animationInterval = arguments[2];
                }
            },
            initAnimation: function(fromWidth,fromHeight, toWidth,toHeight){
                var keyframes = '';
                /*keyframes+=createKeyframe(previewKeyframeIn,'filter:blur(0);\n','width:'+toPX(toWidth)+';\n height:'+toPX(toHeight)+';\n filter:blur(2px);\n');
                keyframes+=createKeyframe(previewKeyframeOut,'filter:blur(2px);\n','width:'+toPX(fromWidth)+';\n height:'+toPX(fromHeight)+';\n filter:blur(0);\n');*/
                keyframes+=createKeyframe(showFrameIn,'filter:blur(2px);\n','filter:blur(0);\n');
                keyframes+=createKeyframe(hideFrameOut,'','');
                styleSheet = document.createElement( 'style' );
                styleSheet.setAttribute('type','text/css');
                styleSheet.innerHTML = keyframes;
                document.getElementsByTagName( 'head' )[ 0 ].appendChild( styleSheet );
            },
            load: function(model,destinationId){
                if(typeof frameContainer === undefined || typeof baseHtmlFrame === undefined){
                    console.log('MK models utils are not initialized. Use init(MK_IFRAME_ID, MK_IFRAME_CONTAINER); to initialize.');
                    return;
                }
                var destination = document.getElementById(destinationId);

                var editorMode = false;
                var sheet = -1;
                var forceHideSheets = false;
                var fullscreen = null;
                var showHelpInside = null;
                var showHomeButton = true;

                frameContainer.style.visibility = 'hidden';
                frameContainer.addEventListener("animationend", function(){frameContainer.style.animation =''; }, false);
                baseHtmlFrame.style.width = toPX(model.width);
                baseHtmlFrame.style.height = toPX(model.height);
                startedLoading = true;
                baseHtmlFrame.contentWindow.loadModelAndCall(model.base64, editorMode, sheet, forceHideSheets, fullscreen, showHelpInside,null, showHomeButton, function(){
                    frameContainer.style.position = 'absolute';
                    frameContainer.style.left = toPX((document.documentElement.clientWidth - model.width) / 2 );
                    frameContainer.style.top = toPX(destination.offsetTop);
                    frameContainer.style.width =  toPX(model.width);
                    frameContainer.style.height =  toPX(model.height);
                    loading = false;
                    if(animating == false){
                        frameContainer.style.visibility =  'visible';
                        frameContainer.style.animation = animationShow();
                    }
                });
                if((typeof window.frameLocation !== undefined) &&  (window.frameLocation != null)){
                    window.frameLocation.style.animation = model.animationOut();
                }
                window.frameLocation = destination;
                window.oldWidth = destination.offsetWidth;
                window.oldHeight = destination.offsetHeight;

                animationListener =  function(){
                    animating = false;
                    if(loading == false){
                        frameContainer.style.visibility =  'visible';
                        frameContainer.style.animation = animationShow();
                    }
                }
                destination.addEventListener("animationend", animationListener, false);
                animating = true;
                destination.style.animation = model.animationIn();
            },
            create: function(base64,width,height){
                if(arguments.length == 5)
                    return new MKModel(base64, width, height, arguments[3], arguments[4]);
                else
                    return new MKModel(base64, width/2, height/2, width, height);
            },
            initWithDefaults: function(){
                MKModelUtils.initFrames('frameContainer','baseHtmlIframe');
                MKModelUtils.initAnimation(502,361,1004,722);
            }
        };
})();