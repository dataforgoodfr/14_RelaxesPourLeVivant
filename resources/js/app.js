import '../css/colors.css'
import '../css/fonts.css'
import '../css/navbar.css'
import '../css/app.css'
import '../css/bs_override.css'
import '../css/multi_select.css'
import 'wc-datepicker/dist/themes/light.css'
import { WcDatepicker } from 'wc-datepicker/dist/components/wc-datepicker'

customElements.define('wc-datepicker', WcDatepicker)

import.meta.glob(['../images/**', '../fonts/**'])
