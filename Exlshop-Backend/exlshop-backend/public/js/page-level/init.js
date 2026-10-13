(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define("/dashboard/v1", ["jquery", "Site"], factory);
    } else if (typeof exports !== "undefined") {
        factory(require("jquery"), require("Site"));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.jQuery, global.Site);
        global.dashboardV1 = mod.exports;
    }
})(this, function (_jquery, _Site) {
    "use strict";
    _jquery = babelHelpers.interopRequireDefault(_jquery);
    (0, _jquery.default)(document).ready(function ($$$1) {
        (0, _Site.run)();
    });
});

$('#chat-panel').on('click', function () {
    var direction = $(this).data('direction');
    if ($('.slidePanel').is(':visible')) {
        $.slidePanel.hide();
    }
    $.slidePanel.show({
        content: `<div class="list-group">
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-away">
                  <img src="https://randomuser.me/api/portraits/men/2.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Mary Adams</h5>
                <small>I am superman</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-busy">
                  <img src="https://randomuser.me/api/portraits/men/3.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Caleb Richards</h5>
                <small>I am tiger</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-online">
                  <img src="https://randomuser.me/api/portraits/men/4.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">June Lane</h5>
                <small>I am dog</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-off">
                  <img src="https://randomuser.me/api/portraits/men/5.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Edward Fletcher</h5>
                <small>I am kikty</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-busy">
                  <img src="https://randomuser.me/api/portraits/men/6.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Crystal Bates</h5>
                <small>I am cat</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-online">
                  <img src="https://randomuser.me/api/portraits/men/7.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Nathan Watts</h5>
                <small>I am monkey</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-online">
                  <img src="https://randomuser.me/api/portraits/men/8.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Heather Harper</h5>
                <small>I am snake</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-online">
                  <img src="https://randomuser.me/api/portraits/men/9.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Willard Wood</h5>
                <small>I am sheep</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-away">
                  <img src="https://randomuser.me/api/portraits/men/10.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Ronnie Ellis</h5>
                <small>I am lion</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-off">
                  <img src="https://randomuser.me/api/portraits/men/11.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Gwendolyn Wheeler</h5>
                <small>I am goldfish</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-busy">
                  <img src="https://randomuser.me/api/portraits/men/12.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Daniel Russell</h5>
                <small>I am rabbit</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-online">
                  <img src="https://randomuser.me/api/portraits/men/13.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Sarah Graves</h5>
                <small>I am dolphin</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-online">
                  <img src="https://randomuser.me/api/portraits/men/14.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Andrew Hoffman</h5>
                <small>I am horse</small>
              </div>
            </div>
          </a>
          <a class="list-group-item" href="javascript:void(0)" data-toggle="show-chat">
            <div class="media">
              <div class="pr-20">
                <div class="avatar avatar-sm avatar-away">
                  <img src="https://randomuser.me/api/portraits/men/15.jpg" alt="..." />
                  <i></i>
                </div>
              </div>
              <div class="media-body">
                <h5 class="mt-0 mb-5">Camila Lynch</h5>
                <small>I am dragon</small>
              </div>
            </div>
          </a>
        </div>`
    }, {
        direction: direction,
        useCssTransforms3d: false,
        useCssTransforms: false,
        useCssTransitions: false
    });
});