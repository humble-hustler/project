var SINGLE_WORKOUT_PROGRAM = SINGLE_WORKOUT_PROGRAM || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf
            const workoutProgramId = _args.workoutProgramId;

            $(document).ready(function () {

                $('#exercise-id, #update-exercise-id').select2({
                    placeholder: 'Search Exercise',
                    ajax: {
                        url: '/app/settings/search/exercise',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    exercise: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.exercises.forEach((e) => {
                                    searchResult.push({
                                        id: e.id,
                                        text: e.name
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                $('#days, #update-days').select2()

                $('#add-workout-exercise').on('click', function () {
                    const exerciseId = $('#exercise-id').val();
                    const days = $('#days').val().join(',');
                    const sets = $('#sets').val();
                    const repetition = $('#repetition').val();
                    const weight = $('#weight').val();
                    const time = $('#time').val();
                    const distance = $('#distance').val();

                    $.ajax({
                        url: '/app/schedule/add/workout-exercise',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            workoutProgramId,
                            exerciseId,
                            days,
                            sets,
                            repetition,
                            weight,
                            time,
                            distance
                        },
                        success: function (data) {
                            if(data.success){
                                toastr.success('Workout Excercise Successfully Added!')
                            }else{
                                toastr.error('Some error Occurred!');
                            }
                            window.location.reload();
                        }
                    });
                })

                $('.delete-workout-excercise').click(function(){
                    $('#delete-wo-excerise-id').val($(this).attr('wo_id'));
                })

                $('.update-workout-excercise').click(function(){
                    var id = $(this).attr('wo_id');
                    $('#update-wo-excerise-id').val(id);

                    $.ajax({
                        url:'/app/schedule/get-single-wo-excercise',
                        method:'POST',
                        data:{
                            _csrf,
                            id
                        },
                        success: function(data){
                            if(data.success){
                                var excercise = data.excercise;
                                $('#update-exercise-id').append(`<option value='${excercise.wo_exercise_id}' selected>${excercise.excercise_name}</option>`);
                                $('#update-days').append(`<option value='${excercise.day}' selected>${excercise.day_name}</option>`);
                                $('#update-sets').val(excercise.sets);
                                $('#update-repetition').val(excercise.repetition);
                                $('#update-weight').val(excercise.weight);
                                $('#update-time').val(excercise.time);
                                $('#update-distance').val(excercise.distance);
                            }
                        }
                    })
                })

                $('#print-workout').click(function(){
                    window.print();
                })
            });
        }
    };
}());