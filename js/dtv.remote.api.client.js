var dtvRemote;



$(document).ready(function() {
    
    
    // Get Query string params
    let params = new URL(window.location.href).searchParams;
    ipaddress = params.get('ip');
    boxAddr = params.get('boxaddr');
    if (!(boxAddr)) {
        boxAddr = '0';
    }
    console.log('IP:' +  ipaddress + ' Box:' + boxAddr); 

    // Helper do capitalize string
    String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
    
    // Global variable for the remote.  (I realize this is a faux pas but this is a quick example.)
    

    var refreshCurrentChannel = function() {
        dtvRemote.getTuned({callback: function(result) {
            if (result.episodeTitle) {
                $('#program-title').html(result.title + ' <small>' + result.episodeTitle + '</small>');
            } else {
                $('#program-title').text(result.title);
            }

            $('#program-callsign').html(result.callsign + ' <small>' + result.major + '</small>');
        }});
    };

    // Click handler for the remote buttons
    $('#remote-buttons a.btn').click(function(e) {
        dtvRemote.processKey({clientAddr: boxAddr, key: this.id, callback: function(result) {
            if (result.status.code !== 200) {
                alert(result.status.msg);
            }
        }});
    });


    // Get setup box
    try {
        dtvRemote = new DirecTV.Remote({ipAddress: ipaddress});
    } catch (err) {
        alert(err);
    }

    // Get active locations
    dtvRemote.getLocations({callback: function(result) {
        locations = result.locations;
        locations.forEach(function(box, i) { 
            boxname = box.locationName.toLowerCase();
            var ele = document.createElement("a");
            ele.classList = "dropdown-item";
            ele.href = "#";
            ele.innerText = "" + i;
            ele.text = boxname.capitalize();
            document.querySelector(".dropdown-menu").appendChild(ele);
        });
        
        $('#dropdownMenuButton').prop("textContent", locations[0].locationName.toLocaleLowerCase().capitalize());

    }});
    
    // Handle dropdown selection
    $(document).on("click", "a.dropdown-item",function(event){
        var x = $(event.currentTarget).text(); 
        $('#dropdownMenuButton').prop("textContent", x);
        console.log(x);
    });


    // Validate and do stuff
    dtvRemote.validate({callback: function(result) {
        if (result.status.code === 200) {
            // Initialize the remote
            dtvRemote.getTuned({clientAddr: boxAddr, callback: function(result) {
                if (result.episodeTitle) {
                    $('#program-title').html(result.title + ' <small>' + result.episodeTitle + '</small>');
                } else {
                    $('#program-title').text(result.title);
                }

                $('#program-callsign').html(result.callsign + ' <small>' + result.major + '</small>');

                $('#main-container').empty();
                $('#main-container').append($('#main-content'));
                $('#main-content').toggleClass('hide');
''
                dtvRemote.ccJob = setInterval(refreshCurrentChannel, 5000);

            }});
        } else {
            alert(result.status.msg);
            $('#ip-address-dialog button.btn').toggleClass('disabled');
        }
    }});
});