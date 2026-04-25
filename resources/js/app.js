import '../css/colors.css'
import '../css/fonts.css'
import '../css/navbar.css'
import '../css/app.css'
import '../css/bs_override.css'
import 'wc-datepicker/dist/themes/light.css'
import { WcDatepicker } from 'wc-datepicker/dist/components/wc-datepicker'
import MultiSelect from './multi_select'
import DateRangePicker from './date_range_picker'

customElements.define('wc-datepicker', WcDatepicker)
MultiSelect.init(document)
DateRangePicker.init(document)

import.meta.glob(['../images/**', '../fonts/**'])
