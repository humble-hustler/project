var SCHEDULE = SCHEDULE || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const schedule = JSON.parse(_args.schedule);
            const locationInfo = JSON.parse(_args.locationInfo);

            $(document).ready(function () {

                /* START - Init Fullcalendar.io */
                var events = [];
                schedule.forEach((s) => {
                    var week_arr = [];
                    var start_date = moment(s.start_date);
                    var end_date = moment(s.expiry_date);
                    //get the difference in days to attach PT for that many days
                    var difference = end_date.diff(start_date,'days')
                    if(s.week_days  != 'all'){
                        week_arr = s.week_days.split(',');
                    }
                    for(var i=0; i<difference;i++){
                        var next_date = moment(start_date).add(i, 'days').format('YYYY-MM-DD');
                        var start_date_time = moment(next_date+' '+s.start_time);
                        var end_date_time = moment(next_date+' '+s.end_time); 
                      
                        if(s.week_days == 'all'){
                            events.push({
                                title: `${s.member_fname} ${s.member_lname} (Trainer: ${s.trainer_fname} ${s.trainer_lname})`,
                                start: moment(start_date_time).format('YYYY-MM-DD hh:mm a'),
                                end: moment(end_date_time).format('YYYY-MM-DD hh:mm a'),
                                data: s
                            })
                        }else{
                            var dow = start_date_time.day();
                            week_arr.forEach(function(w){
                                if(w == dow){
                                    events.push({
                                        title: `${s.member_fname} ${s.member_lname} (Trainer: ${s.trainer_fname} ${s.trainer_lname})`,
                                        start: moment(start_date_time).format('YYYY-MM-DD HH:mm:ss'),
                                        end: moment(end_date_time).format('YYYY-MM-DD HH:mm:ss'),
                                        data: s
                                    })
                                }
                            })
                        }
                    }
                    
                })
             
                var calendatOpts = {
                    defaultView: 'agendaDay',
                    header: {
                        left: null,
                        center: 'prev,title,next',
                        right: 'agendaDay,agendaWeek,month'
                    },
                    minTime: locationInfo.operating_hour_start,
                    maxTime: locationInfo.operating_hour_end,
                    eventClick: function eventClick(e) {
                        const data = e.data
                        $('#event-details').modal();
                        $('#event-details-table tbody').empty().append(`<tr><td>${data.trainer_fname} ${data.trainer_lname}</td> <td>${data.member_fname} ${data.member_lname}</td> <td>${moment(e.start).format('hh:mm a')}</td> <td>${moment(e.end).format('hh:mm a')}</td></tr>`)
                    },
                    events: events
                };

                $('#calendar').fullCalendar(calendatOpts);
                /* END - Init Fullcalendar.io */

                $('#trainers').change(function(){
                    events = [];
                    if($(this).val()){
                        $.ajax({
                            url: '/app/schedule/get-trainer-slots',
                            method: 'POST',
                            data:{
                                _csrf,
                                trainerId: $(this).val()
                            },
                            success: function(data){
                                if(data.success){
                                    data.schedule.forEach((s) => {

                                        var week_arr = [];
                                        var start_date = moment(s.start_date);
                                        var end_date = moment(s.expiry_date);
                                        //get the difference in days to attach PT for that many days
                                        var difference = end_date.diff(start_date,'days')
                                        if(s.week_days  != 'all'){
                                            week_arr = s.week_days.split(',');
                                        }
                                        for(var i=0; i<difference;i++){
                                            var next_date = moment(start_date).add(i, 'days').format('YYYY-MM-DD');
                                            var start_date_time = moment(next_date+' '+s.start_time);
                                            var end_date_time = moment(next_date+' '+s.end_time); 
                                          
                                            if(s.week_days == 'all'){
                                                events.push({
                                                    title: `${s.member_fname} ${s.member_lname} (Trainer: ${s.trainer_fname} ${s.trainer_lname})`,
                                                    start: moment(start_date_time).format('YYYY-MM-DD hh:mm a'),
                                                    end: moment(end_date_time).format('YYYY-MM-DD hh:mm a'),
                                                    data: s
                                                })
                                            }else{
                                                var dow = start_date_time.day();
                                                week_arr.forEach(function(w){
                                                    if(w == dow){
                                                        events.push({
                                                            title: `${s.member_fname} ${s.member_lname} (Trainer: ${s.trainer_fname} ${s.trainer_lname})`,
                                                            start: moment(start_date_time).format('YYYY-MM-DD HH:mm:ss'),
                                                            end: moment(end_date_time).format('YYYY-MM-DD HH:mm:ss'),
                                                            data: s
                                                        })
                                                    }
                                                })
                                            }
                                        }
                                        
                                    })
                                    $('#calendar').fullCalendar('removeEvents');
                                    $('#calendar').fullCalendar('addEventSource', events);         
                                    $('#calendar').fullCalendar('rerenderEvents');
                                }
                            }
                        })  
                    }                  
                })
            });
        }
    };
}());

