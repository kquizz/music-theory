require "application_system_test_case"

class MusicTheoryTest < ApplicationSystemTestCase
  test "changing mode to chord updates the URL and keeps the canvas" do
    visit root_path
    assert_selector "canvas"

    find("[data-music-theory-target='mode']").select "Chords"
    # first chord option is Major (maj); pick a specific chord
    find("[data-music-theory-target='root']").select "A"

    assert_current_path %r{/guitar/chord/A/}
    assert_selector "canvas"
  end

  test "switching instrument to piano still renders a canvas" do
    visit "/guitar/scale/C/major"
    find("[data-music-theory-target='instrument']").select "Piano"
    assert_current_path %r{/piano/scale/C/major}
    assert_selector "canvas"
  end
end
