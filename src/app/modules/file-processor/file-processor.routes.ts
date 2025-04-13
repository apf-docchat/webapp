import { Routes } from "@angular/router";
import { FileProcessorPageComponent } from "./pages/file-processor-page/file-processor-page.component";
import { DocChatComponent } from "./components/doc-chat/doc-chat.component";
import { DocGuideComponent } from "./components/doc-guide/doc-guide.component";
import { ListModulesComponent } from "./components/list-modules/list-modules.component";

export const routes: Routes = [
    {
        path: '',
        component: FileProcessorPageComponent,
        children: [
            {
                path: '',
                component: ListModulesComponent
            },
            {
                path: 'docChat-settings',
                component: DocChatComponent
            },
            {
                path: 'docGuide-settings',
                component: DocGuideComponent
            }
        ]
    }
]