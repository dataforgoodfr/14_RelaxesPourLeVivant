import env from '#start/env'
import string from '@adonisjs/core/helpers/string'
import { icons as phIcons } from '@iconify-json/ph'
import { addCollection, edgeIconify } from 'edge-iconify'
import edge from 'edge.js'
import { DateTime } from 'luxon'
import content from '../app/data/content.json' with { type: 'json' }
import audienceHelper from '../app/view_helpers/audience_helper.js'

edge.global('DateTime', DateTime)
edge.global('stringHelper', string)

addCollection(phIcons)
edge.use(edgeIconify)
edge.global('env', env)
edge.global('content', content)

edge.global('audienceHelper', audienceHelper)
