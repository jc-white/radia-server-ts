export interface IPostgresChangeNotification {
	tableName: string,
	op: string | 'INSERT' | 'UPDATE' | 'DELETE',
	new: Array<string>,
	old: Array<string>
}