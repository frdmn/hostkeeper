//Validation
jQuery.validator.addMethod('validIP', function(value) {
    var split = value.split('.');
    if (split.length != 4)
        return false;

    for (var i=0; i<split.length; i++) {
        var s = split[i];
        if (s.length==0 || isNaN(s) || s<0 || s>255)
            return false;
    }
    return true;
}, ' Invalid IP Address');
