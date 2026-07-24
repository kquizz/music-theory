class ViewsController < ApplicationController
  INSTRUMENTS = %w[guitar piano trumpet].freeze
  ROOTS = %w[C C# D D# E F F# G G# A A# B Db Eb Gb Ab Bb].freeze
  # Keep in sync with app/javascript/theory/scales.js and chords.js.
  SCALES = %w[major dorian phrygian lydian mixolydian aeolian minor locrian
              major_pentatonic minor_pentatonic blues major_blues harmonic_minor
              melodic_minor phrygian_dominant lydian_dominant altered whole_tone
              diminished_wh diminished_hw hungarian_minor].freeze
  CHORDS = %w[maj min dim aug sus2 sus4 power5 maj6 m6 sixnine maj7 dom7 m7 mmaj7
              dim7 m7b5 aug7 dom7sus4 add9 dom9 maj9 m9 dom11 dom13 dom7b9 dom7s9].freeze

  def show
    @instrument = params[:instrument]
    @mode = params[:mode]
    @root = params[:root]
    @name = params[:name]
    redirect_to(root_path) and return unless valid_state?
  end

  private

  def valid_state?
    return false unless INSTRUMENTS.include?(@instrument)
    return false unless ROOTS.include?(@root)

    case @mode
    when "scale" then SCALES.include?(@name)
    when "chord" then CHORDS.include?(@name)
    when "notes", "circle" then true
    else false
    end
  end
end
