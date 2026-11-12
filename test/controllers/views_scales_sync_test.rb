require "test_helper"

# The server whitelists scale names for URLs; it must match the JS catalog or
# new scales silently redirect home.
class ViewsScalesSyncTest < ActiveSupport::TestCase
  test "server scale list matches app/javascript/theory/scales.js" do
    js = Rails.root.join("app/javascript/theory/scales.js").read
    block = js[/export const SCALES = \{(.*?)\n\}\n/m, 1]
    js_keys = block.scan(/^\s+(\w+): \{ name:/).flatten
    assert_equal js_keys.sort, ViewsController::SCALES.sort
  end
end
