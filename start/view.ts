import env from '#start/env'
import string from '@adonisjs/core/helpers/string'
import edge from 'edge.js'
import { DateTime } from 'luxon'

edge.global('DateTime', DateTime)
edge.global('stringHelper', string)
edge.global('env', env)
