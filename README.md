Pinmarklet Custom Images
==========

Script based on the original pinmarklet for Pinterst allows to share custom images on Pinterest
<br/>
The script uses jQuery.

##Usage:
### Add the scripts required
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
    <script type="text/javascript" src="pinmarklet.js"></script>

### Add a link as:
    <a id="pinterest" href="#"><img src="images/PinExt.png"></a>

> The link will be as: 
    <a id="pinterest" href="#"><img src="http://assets.pinterest.com/images/PinExt.png"></a>
    


### Handle the event on click with jQuery

    <script type="text/javascript">`
    $("#pinterest").click(function(){
        var imgArray = { 
            images: [
                {
                    src: "https://lh6.ggpht.com/oJ-bWH2rXcm4OozwnAxatnyBMIjbNDGtZtmvvzTgwzz7gYUI4Rm1_U7uUS0Q5xCMOj8=w124",
                    alt: "Image from Google Images"
                },
                {
                    src: "https://lh6.ggpht.com/_lTfuXOfXmr6ltzuSnKKMJ7sgTYcxAAsrRZOXUHnm3-ANUTIPvYoEo2De04LV95jDqc=h230",
                    alt: "Image from Google Images"
                }
            ]
        };
        
        UTIL.pinterest.addPinMarklet({
            images : imgArray.images
        });
        return false;
    });
</script>

### Add login onPin
If requires execute a function when the image is clicked for share with pinterest add a function onPin

    UTIL.pinterest.addPinMarklet({
        images : imgArray.images,
        onPin : function(){
            console.log("onPin event you can execute whatever you need");
        }
    });

### Exemple

There are a simple example on <pre><code>index.html</code></pre>
