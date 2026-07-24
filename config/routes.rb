Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  root "views#show", defaults: { instrument: "guitar", mode: "scale", root: "C", name: "major" }
  get "/:instrument/scale/:root/:name", to: "views#show", defaults: { mode: "scale" }
  get "/:instrument/chord/:root/:name", to: "views#show", defaults: { mode: "chord" }
  get "/:instrument/notes/:root", to: "views#show", defaults: { mode: "notes" }
end
