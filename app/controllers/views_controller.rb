class ViewsController < ApplicationController
  INSTRUMENTS = %w[guitar piano].freeze
  ROOTS = %w[C C# D D# E F F# G G# A A# B Db Eb Gb Ab Bb].freeze
  SCALES = %w[major dorian phrygian lydian mixolydian aeolian minor locrian
              major_pentatonic minor_pentatonic harmonic_minor melodic_minor].freeze
  CHORDS = %w[maj min dim aug sus2 sus4 6 m6 maj7 m7 7 dim7 m7b5].freeze

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
    when "notes" then true
    else false
    end
  end
end
