# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin_all_from "app/javascript/theory", under: "theory"
pin_all_from "app/javascript/instruments", under: "instruments"
pin_all_from "app/javascript/renderers", under: "renderers"
pin_all_from "app/javascript/audio", under: "audio"
pin "three", to: "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
pin "three/addons/controls/OrbitControls.js", to: "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"
