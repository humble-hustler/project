var SETTINGS = SETTINGS || (function () {
    return {
        init: function (Args) {
            const _args = Args;
            const _csrf = _args._csrf;
            const taxes = _args.taxes;
            const designations = JSON.parse(_args.designations);
            $(document).ready(function () {

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/settings/get/exercise',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'exercise_name'},
                        {'data': 'exercise_type'},
                        {'data': 'muscle_target'},
                        {'data': 'equipment_name'},
                        {'render': function(data, type, row, meta){
                            data = `<a class="update-exercise-master" exercise_master_id="${row.id}">\n\
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>\n\
                                    </a> &nbsp;&nbsp;
                                    <a class="delete-exercise-master" data-target="#delete-master-setting" data-toggle="modal" exercise_master_id="${row.id}">\n\
                                        <i class="fa fa-trash" aria-hidden="true" ></i>\n\
                                    </a>`;
                            return data;
                            }
                        }
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    }],
                    'order': [[ 0, "asc" ]]
                };

                var table = $('#exercise-list').DataTable(dataTableOpt);

                /* Add Workout Level. E.g. Beginner, Advanced */
                $('#add-workout-level').on('click', function (e) {
                    e.preventDefault();
                    var $value = $('#workout-level-text');
                    $.ajax({
                        url: '/app/settings/add/workout-level',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            workoutLevel: $value.val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#workout-level-list').append(`<li class="list-group-item">
                                    <span class="content">${$value.val()}</span>
                                    <a class="float-right update-workout-level" workout_level_id="`+data.id+`">
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>
                                    </a></li>`);
                                $value.val('');
                                toastr.success('Workout Level has been successfully Added!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })

                /* Add Fitness Goals. E.g. Transformation, Weight Loss */
                $('#add-fitness-goal').on('click', function (e) {
                    e.preventDefault();
                    var $value = $('#fitness-goal-text');
                    $.ajax({
                        url: '/app/settings/add/fitness-goals',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            fitnessGoals: $value.val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#fitness-goals-list').append(`<li class="list-group-item">
                                    <span class="content">${$value.val()}</span>
                                    <a class="float-right update-fitness-goals" fitness_goal_id="`+data.id+`">
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>
                                    </a></li>`);
                                $value.val('');
                                toastr.success('Fitness Goal has been successfully Added!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })

                /* Add Fitness Goals. E.g. Cardio, Strength */
                $('#add-exercise-type').on('click', function (e) {
                    e.preventDefault();
                    var $value = $('#exercise-type-text');
                    $.ajax({
                        url: '/app/settings/add/exercise-type',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            exerciseType: $value.val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#exercise-type-list').append(`<li class="list-group-item">
                                    <span class="content">${$value.val()}</span>
                                    <a class="float-right update-excercise-type" excercise_type_id="`+data.id+`">
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>
                                    </a></li>`);
                                $value.val('');
                                toastr.success('Excercise Type has been successfully Added!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })

                $('#delete-logo').on('click',function(e){
                    e.preventDefault();
                    var location_id = $('#brand_location_id').val();
                    $.ajax({
                        url : '/app/settings/delete-logo',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            location_id : location_id
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Logo Successfully Deleted!');
                                window.location.reload();
                            } else {
                                toastr.error('Some Error occurred. Please try again!');
                            }
                        }

                    })
                })

                /* Add Muscle Target. Eg. Legs, Chest */
                $('#add-muscle-target').on('click', function (e) {
                    e.preventDefault();
                    var $value = $('#muscle-target-text');
                    $.ajax({
                        url: '/app/settings/add/muscle-target',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            muscleTarget: $value.val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#muscle-target-list').append(`<li class="list-group-item">
                                    <span class="content">${$value.val()}</span>
                                    <a class="float-right update-muscle-target" muscle_target_id="`+data.id+`">
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>
                                    </a></li>`);
                                $value.val('');
                                toastr.success('Muscle Target has been successfully Added!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })

                /* Add Equipment. Eg. Treadmill, Barbell */
                $('#add-equipment').on('click', function (e) {
                    e.preventDefault();
                    var $value = $('#equipment-text');
                    $.ajax({
                        url: '/app/settings/add/equipment',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            equipmentName: $value.val(),
                            category: $('#category').val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#equipment-list').DataTable().ajax.reload();
                                $value.val('');
                                toastr.success('Equipment has been successfully Added!');
                                $('#category').val('');

                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                
                /* Add Lead Status. Eg. Hot, Warm, Cold */
                $('#add-lead-status').on('click', function (e) {
                    e.preventDefault();
                    var $value = $('#status-text');
                    $.ajax({
                        url: '/app/settings/add/lead-status',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            status: $value.val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#lead-status-list').append(`<li class="list-group-item"><span class="content">${$value.val()}</span>
                                    <a class="float-right update-lead-status" lead_status_id="`+data.id+`">
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>
                                    </a> </li>`);
                                $value.val('');
                                toastr.success('Lead Status has been successfully Added!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                
                /* Add Lead Source. Eg. Hot, Warm, Cold */
                $('#add-lead-source').on('click', function (e) {
                    e.preventDefault();
                    var $value = $('#source-text');
                    $.ajax({
                        url: '/app/settings/add/lead-source',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            source: $value.val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#lead-source-list').append(`<li class="list-group-item"><span class="content">${$value.val()}</span>
                                    <a class="float-right update-lead-source" lead_source_id="`+data.id+`">
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>
                                    </a></li>`)
                                $value.val('');
                                toastr.success('Lead Source has been successfully Added!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                
                /* Add Department. Eg. Operations, Sales */
                $('#add-department').on('click', function (e) {
                    e.preventDefault();
                    var $value = $('#department-text');
                    $.ajax({
                        url: '/app/settings/add/department',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            department: $value.val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#department-list').append(`<li class="list-group-item"><span class="content">${$value.val()}</span>
                                    <a class="float-right update-department" department_id="`+data.id+`">
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>
                                    </a>
                                    </li>`)
                                $value.val('');
                                toastr.success('Department has been successfully Added!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                
                /* Add Lead Designation. Eg. Sales Executive, Fitness Manager */
                $('#add-designation').on('click', function (e) {
                    e.preventDefault();
                    var $value = $('#designation-text');
                    $.ajax({
                        url: '/app/settings/add/designation',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            designation: $value.val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#designation-list').append(`<li class="list-group-item"><span class="content">${$value.val()}</span>
                                    <a class="float-right update-designation" designation_id="`+data.id+`">
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>
                                    </a>
                                    </li>`)
                                $value.val('');
                                toastr.success('Designation has been successfully Added!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })

                $('#exercise-type-search').select2({
                    placeholder: 'Search Exercise Type',
                    ajax: {
                        url: '/app/settings/search/exercise-type',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    exerciseType: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.exerciseTypes.forEach((w) => {
                                    searchResult.push({
                                        id: w.id,
                                        text: `${w.name}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                $('#muscle-target-search').select2({
                    placeholder: 'Muscle Targetted',
                    ajax: {
                        url: '/app/settings/search/muscle-target',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    muscleTarget: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.muscleTargets.forEach((w) => {
                                    searchResult.push({
                                        id: w.id,
                                        text: `${w.name}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                $('#equipment-search').select2({
                    placeholder: 'Equipment',
                    ajax: {
                        url: '/app/settings/search/equipment',
                        method: 'POST',
                        data: function (params) {
                            if (params.term) {
                                var query = {
                                    _csrf: _csrf,
                                    equipmentName: params.term,
                                }
                                return query;
                            }
                        },
                        processResults: function (data) {
                            if (data.success) {
                                var searchResult = []
                                data.equipments.forEach((w) => {
                                    searchResult.push({
                                        id: w.id,
                                        text: `${w.name}`
                                    })
                                })
                                return {
                                    results: searchResult
                                };
                            }
                        }
                    }
                })

                $('#add-exercise').on('click', function (e) {
                    e.preventDefault();
                    const exerciseName = $('#exercise-name-text').val();
                    const exerciseType = $('#exercise-type-search').val();
                    const muscleType = $('#muscle-target-search').val();
                    const equipment = $('#equipment-search').val();

                    $.ajax({
                        url: '/app/settings/add/exercise',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            exerciseName,
                            exerciseType,
                            muscleType,
                            equipment,
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#exercise-list').DataTable().ajax.reload();
                                $('#exercise-master-form').find('input').val('');
                                $('#exercise-type-search').empty().trigger("change");
                                $('#muscle-target-search').empty().trigger("change");
                                $('#equipment-search').empty().trigger("change");
                                toastr.success('Excercise has been successfully Added!');
                            } else {
                                toastr.error('Some Error occurred. Please try again!');
                            }
                        }
                    });
                })

                /* Validation for phone no*/
                $('#location-phone').on('change', function (e) {
                    $element = $(this);
                    var val = $element.val();

                    if(val){
                        const regex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
                        if ($element.val().length !== 10 || !regex.test(val)) {
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid phone number')
                            $('#update-setting-btn').attr('disabled', true);
                        }else{
                            $element.removeClass('is-invalid').next('.invalid-feedback').text('')
                            $('#update-setting-btn').attr('disabled', false);
                        }
                    }else{
                        $element.removeClass('is-invalid').addClass('is-valid').next('.invalid-feedback').text('')
                        $('#update-setting-btn').attr('disabled', false);
                    }
                    
                })

                /* Email validation*/
                $('#location-email').on('change', function (e) {
                    $element = $(this);
                    const regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                    if($element.val()){
                        if (!regex.test($element.val())) {
                            $element.removeClass('is-valid').addClass('is-invalid').next().next('.invalid-feedback').text('Please enter a valid email address')
                            $('#update-setting-btn').attr('disabled', true);
                        }else{
                            $element.removeClass('is-invalid').next().next('.invalid-feedback').text('')
                            $('#update-setting-btn').attr('disabled', false);
                        }
                    }else{
                        $element.removeClass('is-invalid').next().next('.invalid-feedback').text('')
                        $('#update-setting-btn').attr('disabled', false);
                    }
                })

                /*GST no validation*/
                $('#gstin').on('change', function (e) {
                    $element = $(this);
                    const regex = /^([0-2][0-9]|[3][0-7])[A-Z]{3}[ABCFGHLJPTK][A-Z]\d{4}[A-Z][A-Z0-9][Z][A-Z0-9]$/;

                    if($element.val()){
                        if (!regex.test($element.val())) {
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid GST number')
                            $('#update-setting-btn').attr('disabled', true);
                        }else{
                            $element.removeClass('is-invalid').next('.invalid-feedback').text('')
                            $('#update-setting-btn').attr('disabled', false);
                        }
                    }else{
                        $element.removeClass('is-invalid').next('.invalid-feedback').text('')
                        $('#update-setting-btn').attr('disabled', false);
                    }
                })

                /*Pin code validation*/
                $('#pin-code').on('change', function (e) {
                    $element = $(this);
                    var val = $element.val();

                    if(val){
                        $element = $(this);
                        const regex = /^\d+$/
                        if ($element.val().length !== 6 || !regex.test(val)) {
                            $element.removeClass('is-valid').addClass('is-invalid').next('.invalid-feedback').text('Please enter a valid 6 digit Pin Code')                            
                            $('#update-setting-btn').attr('disabled', true);
                        }
                        else{
                            $element.removeClass('is-invalid').next('.invalid-feedback').text('');
                            $('#update-setting-btn').attr('disabled', false);
                        }
                    }else{
                        $element.removeClass('is-invalid').next('.invalid-feedback').text('')
                        $('#update-setting-btn').attr('disabled', false);
                    }
                })

                $(document).on('change',"#state", function() {
                    $.ajax({
                        url: '/app/common/get-cities',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            stateId: $("#state").val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#city').empty();
                                data.cities.forEach(function(c){
                                    $('#city').append(`<option value="${c.id}">${c.name}</option>`);
                                })
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })

                if(!$('#lat').val() || !$('#lng').val() || $('#lat').val()==0 || $('#lng').val()==0){
                    $('.eighteen').trigger('click')
                }

                $(document).on('change','#reaccNumber', function() {
                    if($("#reaccNumber").val() != $("#accNumber").val()) {
                        toastr.error('Re-entered account number does not match.')
                        return
                    }
                })

                /*Delete Bank Details click*/
                $('.delete-bankDetails').on('click', function(){
                    $('#delete-bankDetails-id').val($(this).attr('details-id'));
                })

                /*Delete Tax click*/
                $('.delete-tax').on('click',function(){
                    $('#delete-tax-id').val($(this).attr('tax_id'));
                })

                /*On click of Update Tax*/
                $('.update-tax').on('click',function(){
                    var allTaxes = JSON.parse(taxes);
                    var taxId = $(this).attr('tax_id');
                    $('#add-new-tax-rate .modal-title').text('Update Tax');
                    $('#add-new-tax-btn').text('Update');
                    $('#add-new-tax-rate form').attr('action','/app/settings/update-tax');
                    allTaxes.forEach(function(t){
                        if(t.id == taxId){
                            $('#tax-label').val(t.label);
                            $('#tax-rate').val(t.rate);
                            $('#update-tax-id').val(t.id);
                        }
                    })
                })

                /*On click of Add Tax*/
                // $('#add-tax-btn').click(function(){
                //     $('#add-new-tax-rate .modal-title').text('Add Tax');
                //     $('#add-new-tax-btn').text('Add');
                //     $('#add-new-tax-rate form').attr('action','/app/settings/add-tax');
                //     $('#add-new-tax-rate input').val('');
                // })

                /*Update Designation Start*/
                $(document).on('click','.update-designation',function(){
                    var id = $(this).attr('designation_id');
                    var $li  = $(this);
                    $('#update-designation-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-designation').removeClass('display-block').addClass('display-hidden');
                    $('#designation-text').val($li.parent().find('.content').text());
                    $('#designation-id').val(id);
                })
                $('#update-designation-btn').on('click',function(){
                    var $value = $('#designation-text');
                    var id = $('#designation-id').val();
                    $.ajax({
                        url: '/app/settings/update/designation',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            designation: $value.val(),
                            id:id
                        },
                        success: function (data) {
                            if (data.success) {
                                $("#designation-list li").find('[designation_id='+id+']').parent().find('.content').text($value.val());
                                $value.val('');
                                $('#update-designation-btn').removeClass('display-block').addClass('display-hidden');
                                $('#add-designation').addClass('display-block').removeClass('display-hidden');
                                toastr.success('Designation has been successfully Updated!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                /*Update Designation End*/

                /*Update Department start*/
                $(document).on('click','.update-department',function(){
                    var id = $(this).attr('department_id');
                    var $li  = $(this);
                    $('#update-department-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-department').removeClass('display-block').addClass('display-hidden');
                    $('#department-text').val($li.parent().find('.content').text());
                    $('#department-id').val(id);
                })
                $('#update-department-btn').click(function(){
                    var $value = $('#department-text');
                    var id = $('#department-id').val();
                    $.ajax({
                        url: '/app/settings/update/department',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            department: $value.val(),
                            id:id
                        },
                        success: function (data) {
                            if (data.success) {
                                $("#department-list li").find('[department_id='+id+']').parent().find('.content').text($value.val());
                                $value.val('');
                                $('#update-department-btn').removeClass('display-block').addClass('display-hidden');
                                $('#add-department').addClass('display-block').removeClass('display-hidden');
                                toastr.success('Department has been successfully Updated!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                /*Update Department end*/

                /*Update Lead Source Start*/
                $(document).on('click','.update-lead-source',function(){
                    var id = $(this).attr('lead_source_id');
                    var $li  = $(this);
                    $('#update-lead-source-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-lead-source').removeClass('display-block').addClass('display-hidden');
                    $('#source-text').val($li.parent().find('.content').text());
                    $('#lead-source-id').val(id);
                })
                $('#update-lead-source-btn').click(function(){
                    var $value = $('#source-text');
                    var id = $('#lead-source-id').val();
                    $.ajax({
                        url: '/app/settings/update/lead/source',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            leadSource: $value.val(),
                            id:id
                        },
                        success: function (data) {
                            if (data.success) {
                                $("#lead-source-list li").find('[lead_source_id='+id+']').parent().find('.content').text($value.val());
                                $value.val('');
                                $('#update-lead-source-btn').removeClass('display-block').addClass('display-hidden');
                                $('#add-lead-source').addClass('display-block').removeClass('display-hidden');
                                toastr.success('Lead Source has been successfully Updated!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                /*Update Lead Source Start*/

                /*Update Lead Status Start*/
                $(document).on('click','.update-lead-status',function(){
                    var id = $(this).attr('lead_status_id');
                    var $li  = $(this);
                    $('#update-lead-status-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-lead-status').removeClass('display-block').addClass('display-hidden');
                    $('#status-text').val($li.parent().find('.content').text());
                    $('#lead-status-id').val(id);
                })
                $('#update-lead-status-btn').click(function(){
                    var $value = $('#status-text');
                    var id = $('#lead-status-id').val();
                    $.ajax({
                        url: '/app/settings/update/lead/status',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            leadStatus: $value.val(),
                            id:id
                        },
                        success: function (data) {
                            if (data.success) {
                                $("#lead-status-list li").find('[lead_status_id='+id+']').parent().find('.content').text($value.val());
                                $value.val('');
                                $('#update-lead-status-btn').removeClass('display-block').addClass('display-hidden');
                                $('#add-lead-status').addClass('display-block').removeClass('display-hidden');
                                toastr.success('Lead Status has been successfully Updated!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                /*Update Lead Status End*/

                /*Update Equipment Start*/
                $(document).on('click','.update-equipment',function(){
                    var id = $(this).attr('equipment_id');
                    var tr  = $(this).closest('tr');
                    $('#update-equipment-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-equipment').removeClass('display-block').addClass('display-hidden');
                    $('#equipment-text').val(tr.find('.equipment_name').text());
                    $('#category').val($(this).attr('category'))
                    $('#equipment-id').val(id);
                });
                $('#update-equipment-btn').click(function(){
                    var $value = $('#equipment-text');
                    var id = $('#equipment-id').val();
                    $.ajax({
                        url: '/app/settings/update/equipment',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            equipmentName: $value.val(),
                            category: $('#category').val(),
                            id:id
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#equipment-list').DataTable().ajax.reload();
                                $value.val('');
                                toastr.success('Equipment has been successfully Updated!');
                                $('#category').val('');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                /*Update Equipment End*/

                /*Update muscle-target Start*/
                $(document).on('click','.update-muscle-target',function(){
                    var id = $(this).attr('muscle_target_id');
                    var $li  = $(this);
                    $('#update-muscle-target-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-muscle-target').removeClass('display-block').addClass('display-hidden');
                    $('#muscle-target-text').val($li.parent().find('.content').text());
                    $('#muscle-target-id').val(id);
                })
                $('#update-muscle-target-btn').click(function(){
                    var $value = $('#muscle-target-text');
                    var id = $('#muscle-target-id').val();
                    $.ajax({
                        url: '/app/settings/update/muscle-target',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            muscleTarget: $value.val(),
                            id:id
                        },
                        success: function (data) {
                            if (data.success) {
                                $("#muscle-target-list li").find('[muscle_target_id='+id+']').parent().find('.content').text($value.val());
                                $value.val('');
                                $('#update-muscle-target-btn').removeClass('display-block').addClass('display-hidden');
                                $('#add-muscle-target').addClass('display-block').removeClass('display-hidden');
                                toastr.success('Muscle Target has been successfully Updated!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                /*Update muscle-target End*/

                /*Update Fitness Goal Start*/
                $(document).on('click','.update-fitness-goals',function(){
                    var id = $(this).attr('fitness_goal_id');
                    var $li  = $(this);
                    $('#update-fitness-goal-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-fitness-goal').removeClass('display-block').addClass('display-hidden');
                    $('#fitness-goal-text').val($li.parent().find('.content').text());
                    $('#fitness-goal-id').val(id);
                })
                $('#update-fitness-goal-btn').click(function(){
                    var $value = $('#fitness-goal-text');
                    var id = $('#fitness-goal-id').val();
                    $.ajax({
                        url: '/app/settings/update/fitness-goals',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            fitnessGoals: $value.val(),
                            id:id
                        },
                        success: function (data) {
                            if (data.success) {
                                $("#fitness-goals-list li").find('[fitness_goal_id='+id+']').parent().find('.content').text($value.val());
                                $value.val('');
                                $('#update-fitness-goal-btn').removeClass('display-block').addClass('display-hidden');
                                $('#add-fitness-goal').addClass('display-block').removeClass('display-hidden');
                                toastr.success('Fitness Goal has been successfully Updated!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                /*Update Fitness Goal End*/

                /*Update Excercise Level Start*/
                $(document).on('click','.update-workout-level',function(){
                    var id = $(this).attr('workout_level_id');
                    var $li  = $(this);
                    $('#update-workout-level-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-workout-level').removeClass('display-block').addClass('display-hidden');
                    $('#workout-level-text').val($li.parent().find('.content').text());
                    $('#workout-level-id').val(id);
                })
                $('#update-workout-level-btn').click(function(){
                    var $value = $('#workout-level-text');
                    var id = $('#workout-level-id').val();
                    $.ajax({
                        url: '/app/settings/update/workout-level',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            workoutLevel: $value.val(),
                            id:id
                        },
                        success: function (data) {
                            if (data.success) {
                                $("#workout-level-list li").find('[workout_level_id='+id+']').parent().find('.content').text($value.val());
                                $value.val('');
                                $('#update-workout-level-btn').removeClass('display-block').addClass('display-hidden');
                                $('#add-workout-level').addClass('display-block').removeClass('display-hidden');
                                toastr.success('Workout Level successfully Updated!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                /*Update Excercise Level End*/

                /*Update Excercise Type Start*/
                $(document).on('click','.update-exercise-type',function(){
                    var id = $(this).attr('exercise_type_id');
                    var $li  = $(this);
                    $('#update-exercise-type-btn').addClass('display-block').removeClass('display-hidden');
                    $('#add-exercise-type').removeClass('display-block').addClass('display-hidden');
                    $('#exercise-type-text').val($li.parent().find('.content').text());
                    $('#exercise-type-id').val(id);
                })
                $('#update-exercise-type-btn').click(function(){
                    var $value = $('#exercise-type-text');
                    var id = $('#exercise-type-id').val();
                    $.ajax({
                        url: '/app/settings/update/exercise-type',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            exerciseType: $value.val(),
                            id:id
                        },
                        success: function (data) {
                            if (data.success) {
                                $("#exercise-type-list li").find('[exercise_type_id='+id+']').parent().find('.content').text($value.val());
                                $value.val('');
                                $('#update-exercise-type-btn').removeClass('display-block').addClass('display-hidden');
                                $('#add-exercise-type').addClass('display-block').removeClass('display-hidden');
                                toastr.success('Excercise Type has been successfully Updated!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })
                /*Update Excercise Level End*/

                $(document).on('click','.update-exercise-master',function(){
                    var id = $(this).attr('exercise_master_id');
                    $.ajax({
                        url: '/app/settings/get-single-exercise',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            id: id
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#exercise_id').val(id);
                                $('#exercise-name-text').val(data.exercise.exercise_name);
                                $('#exercise-type-search').append('<option value="'+data.exercise.exercise_type_id+'" selected>'+data.exercise.exercise_type+'</option>');
                                $('#muscle-target-search').append('<option value="'+data.exercise.muscle_target_id+'" selected>'+data.exercise.muscle_target+'</option>');
                                $('#equipment-search').append('<option value="'+data.exercise.equipment_id+'" selected>'+data.exercise.equipment_name+'</option>');
                                $('#add-exercise').addClass('display-hidden').removeClass('display-block');
                                $('#update-exercise').removeClass('display-hidden').addClass('display-block');
                            }
                        }
                    })
                })
                $('#update-exercise').click(function(){
                    $.ajax({
                        url: '/app/settings/update/exercise',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            id: $('#exercise_id').val(),
                            exerciseName: $('#exercise-name-text').val(),
                            exerciseType: $('#exercise-type-search').val(),
                            muscleTarget: $('#muscle-target-search').val(),
                            equipment: $('#equipment-search').val()
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#exercise-list').DataTable().ajax.reload();
                                $('#add-exercise').removeClass('display-hidden').addClass('display-block');
                                $('#update-exercise').addClass('display-hidden').removeClass('display-block');
                                $('#exercise-master-form').find('input').val('');
                                $('#exercise-type-search').empty().trigger("change");
                                $('#muscle-target-search').empty().trigger("change");
                                $('#equipment-search').empty().trigger("change");
                                toastr.success('Excercise has been successfully Updated!');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    })
                })

                //delete exercise master
                $(document).on('click','.delete-exercise-master',function(){
                    // master setting type
                    // 1= Exercise Master
                    var id = $(this).attr('exercise_master_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('exercise-master');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Exercise Master');
                })

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/settings/get/vendors',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'vendor_name'},
                        {'data': 'vendor_gst'},
                        {'render': function(data, type, row, meta){
                            data = `<a class="update-vendor" vendor_id="${row.id}">\n\
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>\n\
                                    </a>&nbsp;&nbsp;
                                    <a class="delete-vendor" vendor_id="${row.id}" data-target="#delete-master-setting" data-toggle="modal">\n\
                                        <i class="fa fa-trash" aria-hidden="true" ></i>\n\
                                    </a>`;
                            return data;
                            }
                        }
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        }],
                    'order': [[ 0, "asc" ]]
                };

                var table = $('#vendor-list').DataTable(dataTableOpt);

                $('#add-vendor').on('click', function (e) {
                    e.preventDefault();
                    if($('#vendor-name-text').val()){
                        $.ajax({
                            url: '/app/settings/add/vendor',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                vendorName: $('#vendor-name-text').val(),
                                vendorGST: $('#vendor-gst-text').val()
                            },
                            success: function (data) {
                                if (data.success) {
                                    $('#vendor-list').DataTable().ajax.reload();
                                    $('#vendor-name-text').val('');
                                    $('#vendor-gst-text').val('');
                                    toastr.success('Vendor has been successfully Added!');
                                }else{
                                    toastr.error('Some Error Occurred. Please try again!')
                                }
                            }
                        });
                    }else{
                        toastr.error('Please fill the Vendor name for adding the Vendor.');
                    }
                })

                $(document).on('click','.update-vendor',function(){
                    var id = $(this).attr('vendor_id');
                    $.ajax({
                        url: '/app/settings/get-single-vendor',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            id: id
                        },
                        success: function (data) {
                            if (data.success) {
                                $('#vendor_id').val(id);
                                $('#vendor-name-text').val(data.vendor.vendor_name);
                                $('#vendor-gst-text').val(data.vendor.vendor_gst);
                                $('#update-vendor').addClass('display-block').removeClass('display-hidden');
                                $('#add-vendor').removeClass('display-block').addClass('display-hidden');
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    })
                })

                //delete Vendor master
                $(document).on('click','.delete-vendor',function(){
                    var id = $(this).attr('vendor_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('vendor');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete the Selected Vendor');
                })

                $('#update-vendor').click(function(){
                    var id = $('#vendor_id').val();
                    if($('#vendor-name-text').val()){
                        $.ajax({
                            url: '/app/settings/update/vendor',
                            method: 'POST',
                            data: {
                                _csrf: _csrf,
                                vendorName: $('#vendor-name-text').val(),
                                vendorGST: $('#vendor-gst-text').val(),
                                id:id
                            },
                            success: function (data) {
                                if (data.success) {
                                    $('#vendor_id').val('');
                                    $('#vendor-name-text').val('');
                                    $('#vendor-gst-text').val('');
                                    $('#add-vendor').addClass('display-block').removeClass('display-hidden');
                                    $('#update-vendor').removeClass('display-block').addClass('display-hidden');
                                    $('#vendor-list').DataTable().ajax.reload();
                                    toastr.success('Vendor has been successfully Updated!');
                                }else{
                                    toastr.error('Some Error Occurred. Please try again!')
                                }
                            }
                        });
                    }else{
                        toastr.error('Please fill the Vendor name for adding the Vendor.');
                    }
                })

                $('#week-days').select2();

                $('#week-days').change(function(){
                    if($(this).val().indexOf('all') !== -1){
                        $(this).val('');
                        $(this).val('all');
                    }
                })

                $('#time-slot-add-form').submit(function(e){
                    e.preventDefault();
         
                    $.ajax({
                        url: '/app/settings/add-time-slot',
                        method: 'POST',
                        data: {
                            _csrf: _csrf,
                            startTime: $('#start-time').val(),
                            endTime: $('#end-time').val(),
                            weekDays: $('#week-days').val().join(',')
                        },
                        success: function (data) {
                            if (data.success) {
                                toastr.success('Time Slot has been successfully Added!');
                                $('#time-slot-list').DataTable().ajax.reload();
                                $('#start-time').val('');
                                $('#end-time').val('');
                                $('#week-days').val('').change();
                            }else{
                                toastr.error('Some Error Occurred. Please try again!')
                            }
                        }
                    });
                })

                var week_days_arr = ['','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/settings/time-slots',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'start_time'},
                        {'data': 'end_time'},
                        {'data': 'duration'},
                        {'data': 'week_days'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                        'searchable': false,
                        'orderable': false,
                        'className': 'dt-body-center',
                    },{
                        "targets": 3,
                        "render": function (data, type, row) {
                            var days = '';
                            if(data == 'all'){
                                week_days_arr.forEach(function(w){
                                    days += (days)?(', '+w):(w);
                                })
                                return days;
                            }else{
                                var arr = data.split(',');
                                arr.forEach(function(a){
                                    days += (days)?(', '+ week_days_arr[a]):(week_days_arr[a])
                                })
                                return days;
                            }
                            return ``;
                        }
                    },{
                        "targets": 4,
                        "render": function (data, type, row) {
                            data = `<a class="delete-time-slot" data-target="#delete-master-setting" data-toggle="modal" time_slot_id="${row.id}">\n\
                                        <i class="fa fa-trash" aria-hidden="true" ></i>\n\
                                    </a>`;
                            return data;
                        }
                    }],
                    'order': [[ 0, "asc" ]]
                };

                var table = $('#time-slot-list').DataTable(dataTableOpt);

                $('#add-shift').click(function(){
                    var startTime = $('#start-shift-time').val();
                    var endTime = $('#end-shift-time').val();
                    var name = $('#shift-name').val();
                    // get difference
                    var a = moment(startTime, "HH:mm");
                    var b = moment(endTime, "HH:mm");
                    var duration = moment.duration(b.diff(a));
                    var hours = parseInt(duration.asHours());
                 
                    if(startTime && endTime && name){
                        if(hours >= 4){
                            $.ajax({
                                url: '/app/settings/add/shift',
                                method: 'POST',
                                data:{ 
                                    _csrf, 
                                    startTime,
                                    endTime,
                                    name
                                },
                                success: function(data){
                                    if(data.success){
                                        toastr.success('Shift saved Successfully!');
                                        $('#shift-list').DataTable().ajax.reload();
                                        $('#start-shift-time').val('');
                                        $('#end-shift-time').val('')
                                        $('#shift-name').val('')
                                    }else{
                                        toastr.success('Some error Occurred. Please try again!')
                                    }
                                }
                            })
                        }else{
                            toastr.error('The shift should be minimum of 4 Hours.Please select the timing accordingly!');
                        }
                    }else{
                        toastr.error('Please fill the Start and the End Time for Shift');
                    }
                })

                //delete time slot
                $(document).on('click','.delete-time-slot',function(){
                    var id = $(this).attr('time_slot_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('time-slots');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Time slot');
                })

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/settings/get/shifts',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'shift_name'},
                        {'data': 'start_time'},
                        {'data': 'end_time'},
                        {'data': 'duration'},
                        {'render': function(data, type, row, meta){
                            data = `<a class="update-shift" shift_id="${row.id}" >\n\
                                        <i class="fa fa-pencil" aria-hidden="true" ></i>\n\
                                    </a>&nbsp;&nbsp;
                                    <a class="delete-shift" shift_id="${row.id}" data-target="#delete-master-setting" data-toggle="modal">\n\
                                        <i class="fa fa-trash" aria-hidden="true" ></i>\n\
                                    </a>`;
                            return data;
                            }
                        }
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        }],
                    'order': [[ 0, "asc" ]]
                };

                var table = $('#shift-list').DataTable(dataTableOpt);

                $(document).on('click','.update-shift', function(){
                    var shiftId = $(this).attr('shift_id');
                    $.ajax({
                        url: '/app/settings/single/shift',
                        method: 'POST',
                        data: {
                            shiftId,
                            _csrf
                        },
                        success: function(data){
                            if(data.success){
                                var shift = data.shift;
                                $('#start-shift-time').val(shift.start_time);
                                $('#end-shift-time').val(shift.end_time);
                                $('#shift-name').val(shift.shift_name);
                                $('#update-shift-id').val(shiftId);
                                $('#add-shift').addClass('display-hidden');
                                $('#update-shift').removeClass('display-hidden');
                            }
                        }
                    })
                })

                $('#update-shift').click(function(){
                    var startTime = $('#start-shift-time').val();
                    var endTime = $('#end-shift-time').val();
                    var name = $('#shift-name').val();

                    // get difference
                    var a = moment(startTime, "HH:mm");
                    var b = moment(endTime, "HH:mm");
                    var duration = moment.duration(b.diff(a));
                    var hours = parseInt(duration.asHours());
                 
                    if(startTime && endTime && name){
                        if(hours >= 4){
                            $.ajax({
                                url: '/app/settings/update/shift',
                                method: 'POST',
                                data:{ 
                                    _csrf, 
                                    startTime,
                                    endTime,
                                    name,
                                    id: $('#update-shift-id').val()
                                },
                                success: function(data){
                                    if(data.success){
                                        toastr.success('Shift Updated Successfully!');
                                        $('#shift-list').DataTable().ajax.reload();
                                        $('#start-shift-time').val('');
                                        $('#end-shift-time').val('');
                                        $('#shift-name').val('');
                                        $('#add-shift').removeClass('display-hidden');
                                        $('#update-shift').addClass('display-hidden');
                                        toastr.success('Shift has been successfully Updated!');
                                    }else{
                                        toastr.success('Some error Occurred. Please try again!')
                                    }
                                }
                            })
                        }else{
                            toastr.error('The shift should be minimum of 4 Hours.Please select the timing accordingly!');
                        }
                    }else{
                        toastr.error('Please fill the Start and the End Time for Shift');
                    }
                })

                //delete Shift
                $(document).on('click','.delete-shift',function(){
                    // master setting type
                    // 1= Exercise Master
                    var id = $(this).attr('shift_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('shifts');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Shift');
                })

                var dataTableOpt = {
                    'processing': true,
                    'serverSide': true,
                    'autoWidth': false,
                    'ajax': {
                        'method': 'POST',
                        'url': '/app/settings/get/equipments',
                        headers: {
                            'csrf-token': _csrf
                        }
                    },
                    'columns': [
                        {'data': 'name'},
                        {'data': 'type'},
                        {'data': 'id'}
                    ],
                    'ordering': true,
                    'aaSorting': [],
                    'columnDefs': [{
                            'searchable': false,
                            'orderable': false,
                            'className': 'dt-body-center',
                        },{
                            "targets": 0,
                            "render": function (data, type, row) {
                                data = `<span class="equipment_name">${data}</span>`;
                                return data;
                            }
                        },{
                            "targets": 1,
                            "render": function (data, type, row) {
                                if(data == 1){
                                    return 'Gym Equipment';
                                }else{
                                    return 'Office Equipment';
                                }
                            }
                        },{
                            "targets": 2,
                            "render": function (data, type, row) {
                                var data = `<a class="float-right delete-equipment" equipment_id="${row.id}" category='${row.type}' data-target="#delete-master-setting" data-toggle="modal">
                                                <i class="fa fa-trash" aria-hidden="true" ></i>
                                            </a>
                                            <a class="float-right update-equipment" equipment_id="${row.id}" category='${row.type}'>
                                                <i class="fa fa-pencil" aria-hidden="true" ></i>&nbsp;&nbsp;
                                            </a>
                                            `;
                                return data;
                            }
                        }],
                    'order': [[ 0, "asc" ]]
                };

                var table = $('#equipment-list').DataTable(dataTableOpt);
               
                $(document).on('click', '.delete-equipment',function(){
                    var id = $(this).attr('equipment_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('equipment');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Equipment');
                })

                $('.delete-exercise-type').click(function(){
                    var id = $(this).attr('exercise_type_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('exercise-type');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Exercise Type');
                })

                $('.delete-target-muscle').click(function(){
                    var id = $(this).attr('muscle_target_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('target-muscle');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Target Muscle');
                })

                $('.delete-exercise-level').click(function(){
                    var id = $(this).attr('workout_level_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('exercise-level');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Exercise Level');
                })

                $('.delete-fitness-goals').click(function(){
                    var id = $(this).attr('fitness_goal_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('fitness-goal');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Fitness Goal');
                })

                $('.delete-lead-status').click(function(){
                    var id = $(this).attr('lead_status_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('lead-status');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Lead Status');
                })

                $('.delete-lead-source').click(function(){
                    var id = $(this).attr('lead_source_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('lead-source');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Lead Source');
                })

                $('.delete-department').click(function(){
                    var id = $(this).attr('department_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('department');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Department');
                })

                $('.delete-designation').click(function(){
                    var id = $(this).attr('designation_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('designation');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Designation');
                })

                $('.delete-designation').click(function(){
                    var id = $(this).attr('designation_id');
                    $('#delete-master-setting-id').val(id);
                    $('#delete-master-setting-type').val('designation');
                    $('.delete-master-setting-message').text('Are you sure you want to Delete this Designation');
                })
                
                $('#delete-master-setting-btn').click(function(){
                    type =  $('#delete-master-setting-type').val();
                    id = $('#delete-master-setting-id').val();
                    $.ajax({
                        url:'/app/settings/delete-master-setting',
                        method: 'POST',
                        data: {
                            _csrf,
                            id ,
                            type
                        },
                        success: function(data){
                            $('#delete-master-setting').modal('hide');
                            if(data.success){

                                if(type == 'exercise-master'){
                                    $('#exercise-list').DataTable().ajax.reload();
                                    toastr.success('Excercise Successfully Deleted!');
                                }else if(type == 'exercise-type'){
                                    $('#exercise-type-list .list-group-item').each(function(){
                                        if($(this).find('.delete-exercise-type').attr('exercise_type_id') == id){
                                            $(this).remove();
                                        }
                                    })
                                    toastr.success('Exercise Type Successfully Deleted!');
                                }else if(type == 'target-muscle'){
                                    $('#muscle-target-list .list-group-item').each(function(){
                                        if($(this).find('.delete-target-muscle').attr('muscle_target_id') == id){
                                            $(this).remove();
                                        }
                                    })
                                    toastr.success('Muscle Type Successfully Deleted!');
                                }else if(type == 'equipment'){
                                    $('#equipment-list').DataTable().ajax.reload();
                                    toastr.success('Equipment Successfully Deleted!');
                                }else if(type == 'exercise-level'){
                                    $('#workout-level-list .list-group-item').each(function(){
                                        if($(this).find('.delete-exercise-level').attr('workout_level_id') == id){
                                            $(this).remove();
                                        }
                                    })
                                    toastr.success('Exercise level Successfully Deleted!');
                                }else if(type == 'fitness-goal'){
                                    $('#fitness-goals-list .list-group-item').each(function(){
                                        if($(this).find('.delete-fitness-goals').attr('fitness_goal_id') == id){
                                            $(this).remove();
                                        }
                                    })
                                    toastr.success('Fitness Goal Successfully Deleted!');
                                }else if(type == 'lead-status'){
                                    $('#lead-status-list .list-group-item').each(function(){
                                        if($(this).find('.delete-lead-status').attr('lead_status_id') == id){
                                            $(this).remove();
                                        }
                                    })
                                    toastr.success('Lead Status Successfully Deleted!');
                                }else if(type == 'lead-source'){
                                    $('#lead-source-list .list-group-item').each(function(){
                                        if($(this).find('.delete-lead-source').attr('lead_source_id') == id){
                                            $(this).remove();
                                        }
                                    })
                                    toastr.success('Lead Source Successfully Deleted!');
                                }else if(type == 'department'){
                                    $('#department-list .list-group-item').each(function(){
                                        if($(this).find('.delete-department').attr('department_id') == id){
                                            $(this).remove();
                                        }
                                    })
                                    toastr.success('Department Successfully Deleted!');
                                }else if(type == 'designation'){
                                    $('#designation-list .list-group-item').each(function(){
                                        if($(this).find('.delete-designation').attr('designation_id') == id){
                                            $(this).remove();
                                        }
                                    })
                                    toastr.success('Designation Successfully Deleted!');
                                }else if(type == 'vendor'){
                                    $('#vendor-list').DataTable().ajax.reload();
                                    toastr.success('Vendor Successfully Deleted!');
                                }else if(type == 'time-slots'){
                                    $('#time-slot-list').DataTable().ajax.reload();
                                    toastr.success('Time Slot successfully Deleted!');
                                }else if(type == 'shifts'){
                                    $('#shift-list').DataTable().ajax.reload();
                                    toastr.success('Shift Successfully Deleted!');
                                }
                            }else{
                                toastr.error('Some Error occurred!');
                            }
                        }
                    })
                })

                $('.edit-documents').on('click', function (){
                    var col = $(this).attr('name')
                    $("#upload-file-name").attr('name', col)
                    if(col == 'pan_file'){
                        $('#label').empty().append(`Pan Document`)
                    }else if(col == 'gst_file'){
                        $('#label').empty().append(`GST Document`)
                    }
                })

                $('.delete-documents').on('click', function (){
                    var col = $(this).attr('name')
                    $("#delete-name").attr('name', col)
                })

                $("#ifscCode").on('change', function(){
                    var ifsc = $(this).val()
                    var reg = /[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$/;

                    if (!ifsc.match(reg)) {   
                        toastr.error('Please enter valid IFSC code') 
                        return   
                    } 
                })

            });
        }
    };
}());