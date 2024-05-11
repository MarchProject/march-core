export type Action = 'INMaker' | 'INChecker' //ss

export const uamAuthRole = {
  Admin: 'ADMIN',
  SuperAdmin: 'SUPERADMIN',
  Any: 'ANY',
  Free: 'FREE'
}

export namespace uam {
  export type Action =
    //Backoffice
    //inventory
    | 'SSuperUser'
    | 'INMaker'
    | 'INViewer'
    | 'INCSV'
    | 'INBranchMaker'
    | 'INBranchViewer'
    | 'INBrandMaker'
    | 'INBrandViewer'
    | 'INTypeMaker'
    | 'INTypeViewer'
    | 'INTrashMaker'

  export const AnyAdminScope = [
    'SSuperUser',
    'INMaker',
    'INViewer',
    'INCSV',
    'INBranchMaker',
    'INBranchViewer',
    'INBrandMaker',
    'INBrandViewer',
    'INTypeMaker',
    'INTypeViewer',
    'INTrashMaker'
  ] as Action[]

  export const MakerAdminScope = [
    'INMaker',
    'INCSV',
    'INBranchMaker',
    'INBrandMaker',
    'INTypeMaker',
    'INTrashMaker'
  ] as Action[]

  export const ViewerAdminScope = ['INViewer', 'INBranchViewer', 'INBrandViewer', 'INTypeViewer'] as Action[]
}
