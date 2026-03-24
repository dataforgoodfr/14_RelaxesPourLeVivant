import string from '@adonisjs/core/helpers/string'
import edge from 'edge.js'
import { DateTime } from 'luxon'
import { edgeIconify, addCollection } from 'edge-iconify'
import { icons as phIcons } from '@iconify-json/ph'

edge.global('DateTime', DateTime)
edge.global('stringHelper', string)

addCollection(phIcons)
edge.use(edgeIconify)
