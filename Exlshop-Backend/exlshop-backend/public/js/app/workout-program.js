var WORKOUT_PROGRAM = WORKOUT_PROGRAM || (function () {
    var _args = {};
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf

            $(document).ready(function () {
                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/schedule/workout-program/view-all',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'program_name'},
                        {'data': 'workout_level_name'},
                        {'data': 'fitness_goal_name'},
                        {'data': 'age_group_label'},
                        {'data': 'gender'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        }],
                    rowCallback: function (row, data, index) {
                        $(row).attr("data-workout-program-id", data.id);
                    },
                    order:[[0,'asc']]
                };

                var table = $('#workout-program-list').DataTable(dataTableOpt);

                table.on('click', 'tr', function () {
                    if (table.row(this).node() !== null) {
                        var workoutId = $(table.row(this).node()).attr('data-workout-program-id');
                        location.href = location.href + '/' + workoutId;
                    }
                });

                /* START - Init Workout Level Search */
                $('#workout-level-search').select2({
                    placeholder: 'Search Workout Level',
                    ajax: {
                        url: '/app/settings/search/workout-level',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    workoutLevels: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.levels.forEach((l) => {
                                    searchResult.push({
                                        id: l.id,
                                        text: l.name
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })
                /* END - Init Workout Level Search */

                /* START - Init Fitness Goals Search */
                $('#fitness-goal-search').select2({
                    placeholder: 'Search Fitness Goals',
                    ajax: {
                        url: '/app/settings/search/fitness-goals',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    fitnessGoals: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.fitnessGoals.forEach((f) => {
                                    searchResult.push({
                                        id: f.id,
                                        text: f.name
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })
                /* END - Init Fitness Goals Search */

                /* START - Add New Workout Program */
                $('#add-new-workout-program-btn').on('click', function () {
                    $.ajax({
                        url: '/app/schedule/add/workout-program',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            programName: $('#workout-program-text').val(),
                            workoutLevelId: $('#workout-level-search').val(),
                            fitnessGoalId: $('#fitness-goal-search').val(),
                            ageGroupId: $('#age-group').val(),
                            gender: $('.gender-radio:checked').val()
                        },
                        success: function (data) {
                            if (!data.valid) {
                                $('#add-new-workout-program').modal('hide')
                                $('#workout-program-list').DataTable().ajax.reload();
                            } else {
                                toastr.error('Some error occurred. Please try again later')
                            }
                        }
                    });
                })
                /* START - Add New Workout Program */

                // $('#add-workout-btn').click(function(){
                //     $('.modal').css('z-index', '9999!important');
                // })

            });
        }
    };
}());