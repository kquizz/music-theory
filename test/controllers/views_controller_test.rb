require "test_helper"

class ViewsControllerTest < ActionDispatch::IntegrationTest
  test "root renders default guitar C major" do
    get root_path
    assert_response :success
    assert_select "[data-music-theory-instrument-value=?]", "guitar"
    assert_select "[data-music-theory-name-value=?]", "major"
  end

  test "valid scale url renders that state" do
    get "/guitar/scale/D/dorian"
    assert_response :success
    assert_select "[data-music-theory-root-value=?]", "D"
    assert_select "[data-music-theory-mode-value=?]", "scale"
    assert_select "[data-music-theory-name-value=?]", "dorian"
  end

  test "valid chord url renders that state" do
    get "/piano/chord/A/maj7"
    assert_response :success
    assert_select "[data-music-theory-instrument-value=?]", "piano"
    assert_select "[data-music-theory-mode-value=?]", "chord"
  end

  test "notes url renders notes mode" do
    get "/guitar/notes/E"
    assert_response :success
    assert_select "[data-music-theory-mode-value=?]", "notes"
  end

  test "trumpet is a valid instrument" do
    get "/trumpet/scale/C/major"
    assert_response :success
    assert_select "[data-music-theory-instrument-value=?]", "trumpet"
  end

  test "invalid instrument redirects to root" do
    get "/kazoo/scale/C/major"
    assert_redirected_to root_path
  end

  test "invalid scale name redirects to root" do
    get "/guitar/scale/C/bogus"
    assert_redirected_to root_path
  end

  test "invalid root redirects to root" do
    get "/guitar/scale/H/major"
    assert_redirected_to root_path
  end
end
