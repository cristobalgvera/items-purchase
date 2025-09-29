import type { NotifierService } from "./notifier.service";
import { NotifierUiService } from "./notifier-ui.service";

export const notifierService: NotifierService = new NotifierUiService();
