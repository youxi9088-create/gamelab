local M = {}

M.LANG = require "lang.lang"
M.RESZIP = require "liveupdate_reszip.reszip"
M.DEFSAVE = require "defsave.defsave"

M.PARAMS = require "game.globals.params"
M.CONFIG = require "game.globals.config"
M.SDK = require "game.globals.sdk_manager"
M.LM = require "game.globals.level_manager"
M.SM = require "game.globals.sound_manager"
M.HASHES = require "game.globals.hashes"
M.ANIM = require "game.globals.animations"

return M