import '../css/app.css'
import '../css/bs_override.css'
import 'wc-datepicker/dist/themes/light.css'
import { WcDatepicker } from 'wc-datepicker/dist/components/wc-datepicker'
import MultiSelect from './multi_select'
import Datepicker from './datepicker'

customElements.define('wc-datepicker', WcDatepicker)
MultiSelect.init(document)
Datepicker.init(document)

import.meta.glob(['../images/**', '../fonts/**'])
